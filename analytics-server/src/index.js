// Load .env before anything else
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { getDb } = require('./db');
const RateLimiter = require('./middleware/rateLimiter');
const { isBotRequest } = require('./middleware/botFilter');
const { lookupIp } = require('./services/geo');
const { runAggregation } = require('./aggregate');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Rate limiter: 100 events/min per IP for event ingestion
const eventLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000
);

// General rate limiter for stats API
const statsLimiter = new RateLimiter(60, 60000);

// Track server start time for uptime
const START_TIME = Date.now();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  maxAge: 86400,
}));
app.use(express.json({ limit: '100kb' }));

// ============================================================
// Simple JWT verification (mirrors the main app's auth)
// ============================================================
function verifyAnalyticsToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.userId || null;
  } catch {
    return null;
  }
}

// ============================================================
// POST /api/events — Ingest analytics events
// ============================================================
app.post('/api/events', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip
    || req.socket?.remoteAddress
    || '0.0.0.0';

  // Rate limiting
  const { allowed, retryAfterMs } = eventLimiter.check(clientIp);
  if (!allowed) {
    return res.status(429)
      .set('Retry-After', Math.ceil(retryAfterMs / 1000).toString())
      .json({ error: 'Too many requests' });
  }

  // Bot filtering — silently drop bot events
  if (isBotRequest(req)) {
    return res.json({ ok: true, dropped: true });
  }

  // Validate payload
  const { visitor_id, user_id, session_id, events } = req.body;

  if (!visitor_id || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'Invalid payload. Required: visitor_id, events[]' });
  }

  // Look up geolocation
  let geo = null;
  try {
    geo = await lookupIp(clientIp);
  } catch {
    // Geo lookup failed, proceed without it
  }

  const db = getDb();
  const insertView = db.prepare(`
    INSERT INTO page_views (visitor_id, user_id, session_id, path, referrer, title,
      country, city, device_type, browser, os, screen_w, screen_h, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO events (visitor_id, user_id, session_id, event_name, properties, path, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertSession = db.prepare(`
    INSERT INTO sessions (id, visitor_id, user_id, path, country, device_type, browser, os, started_at, last_heartbeat, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      last_heartbeat = excluded.last_heartbeat,
      path = excluded.path,
      user_id = COALESCE(excluded.user_id, sessions.user_id),
      is_active = 1
  `);

  // Start a transaction for batch insert
  const transaction = db.transaction((eventsList) => {
    let lastTimestamp = 0;

    for (const event of eventsList) {
      const ts = event.timestamp || Date.now();
      const props = event.properties ? JSON.stringify(event.properties) : null;

      if (event.name === 'page_view') {
        const { path, referrer, title, device_type, browser, os, screen_w, screen_h } = event.properties || {};
        insertView.run(
          visitor_id, user_id || null, session_id,
          path || '/', referrer || null, title || null,
          geo?.country || null, geo?.city || null,
          device_type || null, browser || null, os || null,
          screen_w || null, screen_h || null, ts
        );
      } else {
        insertEvent.run(
          visitor_id, user_id || null, session_id,
          event.name, props, event.properties?.path || null, ts
        );
      }

      lastTimestamp = Math.max(lastTimestamp, ts);
    }

    // Update/create session
    const firstEvent = eventsList[0];
    const props = firstEvent.properties || {};
    upsertSession.run(
      session_id, visitor_id, user_id || null,
      props.path || '/', geo?.country || null,
      props.device_type || null, props.browser || null, props.os || null,
      lastTimestamp, lastTimestamp
    );
  });

  try {
    transaction(events);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error inserting events:', err);
    res.status(500).json({ error: 'Failed to record events' });
  }
});

// ============================================================
// GET /api/stats — Aggregated statistics
// ============================================================
app.get('/api/stats', async (req, res) => {
  const { range, custom_start, custom_end } = req.query;

  // Verify admin auth for stats access
  const userId = verifyAnalyticsToken(req);
  if (!userId) {
    // Fall back to checking Authorization via main app's shared secret
    const authHeader = req.headers['x-admin-key'];
    if (authHeader !== process.env.ADMIN_API_KEY && (!JWT_SECRET || !verifyAnalyticsToken(req))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const db = getDb();
  const now = Date.now();
  let startMs = 0;

  switch (range) {
    case 'today': {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      startMs = d.getTime();
      break;
    }
    case '24h':
      startMs = now - 24 * 60 * 60 * 1000;
      break;
    case '7d':
      startMs = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case '30d':
      startMs = now - 30 * 24 * 60 * 60 * 1000;
      break;
    case 'custom':
      startMs = parseInt(custom_start) || 0;
      break;
    case 'all':
    default:
      startMs = 0;
      break;
  }

  try {
    // Realtime: active visitors (heartbeat within last 5 minutes)
    const fiveMinAgo = now - 5 * 60 * 1000;
    const activeVisitors = db.prepare(
      'SELECT COUNT(DISTINCT visitor_id) as count FROM sessions WHERE is_active = 1 AND last_heartbeat > ?'
    ).get(fiveMinAgo);

    // Today's page views
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const viewsToday = db.prepare(
      "SELECT COUNT(*) as count FROM page_views WHERE timestamp > ?"
    ).get(todayStart.getTime());

    // Overview stats
    const totalViews = db.prepare(
      'SELECT COUNT(*) as count FROM page_views'
    ).get();

    const totalVisitors = db.prepare(
      'SELECT COUNT(DISTINCT visitor_id) as count FROM page_views'
    ).get();

    // Time series (daily)
    let timeSeries;
    if (range === '24h') {
      // Hourly breakdown for 24h range
      timeSeries = db.prepare(`
        SELECT 
          strftime('%Y-%m-%dT%H:00:00', timestamp / 1000, 'unixepoch') as date,
          COUNT(*) as page_views,
          COUNT(DISTINCT visitor_id) as visitors
        FROM page_views
        WHERE timestamp > ?
        GROUP BY strftime('%Y-%m-%dT%H:00:00', timestamp / 1000, 'unixepoch')
        ORDER BY date ASC
      `).all(startMs);
    } else {
      timeSeries = db.prepare(`
        SELECT 
          strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') as date,
          COUNT(*) as page_views,
          COUNT(DISTINCT visitor_id) as visitors
        FROM page_views
        WHERE timestamp > ?
        GROUP BY strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch')
        ORDER BY date ASC
      `).all(startMs);
    }

    // Top pages
    const topPages = db.prepare(`
      SELECT path, COUNT(*) as views
      FROM page_views
      WHERE timestamp > ?
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `).all(startMs);

    // Top countries
    const topCountries = db.prepare(`
      SELECT country, COUNT(DISTINCT visitor_id) as visitors
      FROM page_views
      WHERE timestamp > ? AND country IS NOT NULL
      GROUP BY country
      ORDER BY visitors DESC
      LIMIT 20
    `).all(startMs);

    // Top referrers
    const topReferrers = db.prepare(`
      SELECT 
        CASE 
          WHEN referrer IS NULL OR referrer = '' THEN 'direct'
          WHEN referrer LIKE '%google.%' THEN 'Google'
          WHEN referrer LIKE '%facebook.%' THEN 'Facebook'
          WHEN referrer LIKE '%twitter.%' OR referrer LIKE '%x.%' THEN 'Twitter/X'
          WHEN referrer LIKE '%linkedin.%' THEN 'LinkedIn'
          WHEN referrer LIKE '%instagram.%' THEN 'Instagram'
          WHEN referrer LIKE '%reddit.%' THEN 'Reddit'
          WHEN referrer LIKE '%youtube.%' THEN 'YouTube'
          ELSE 'other'
        END as source,
        COUNT(*) as visits
      FROM page_views
      WHERE timestamp > ?
      GROUP BY source
      ORDER BY visits DESC
    `).all(startMs);

    // Device breakdown
    const deviceBreakdown = db.prepare(`
      SELECT 
        COALESCE(device_type, 'unknown') as device,
        COUNT(*) as count
      FROM page_views
      WHERE timestamp > ? AND device_type IS NOT NULL
      GROUP BY device
      ORDER BY count DESC
    `).all(startMs);

    // Browser breakdown
    const browserBreakdown = db.prepare(`
      SELECT 
        COALESCE(browser, 'unknown') as browser,
        COUNT(*) as count
      FROM page_views
      WHERE timestamp > ? AND browser IS NOT NULL
      GROUP BY browser
      ORDER BY count DESC
    `).all(startMs);

    // Feature usage
    const featureUsage = db.prepare(`
      SELECT event_name, COUNT(*) as count
      FROM events
      WHERE timestamp > ? AND event_name NOT IN ('page_view', 'session_start', 'session_end')
      GROUP BY event_name
      ORDER BY count DESC
    `).all(startMs);

    // Hourly activity (24 hours)
    const hourlyActivity = db.prepare(`
      SELECT 
        CAST(strftime('%H', timestamp / 1000, 'unixepoch') AS INTEGER) as hour,
        COUNT(*) as count
      FROM page_views
      WHERE timestamp > ?
      GROUP BY hour
      ORDER BY hour ASC
    `).all(startMs);

    // Build the 24-hour array
    const hourlyArray = Array(24).fill(0);
    for (const h of hourlyActivity) {
      if (h.hour >= 0 && h.hour < 24) {
        hourlyArray[h.hour] = h.count;
      }
    }

    // Registrations / user acquisition
    const registrations = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') as date,
        COUNT(*) as count
      FROM events
      WHERE event_name = 'user_registered' AND timestamp > ?
      GROUP BY strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch')
      ORDER BY date ASC
    `).all(startMs);

    // Device breakdown format: { desktop: 55, mobile: 40, tablet: 5 }
    const deviceObj = {};
    for (const d of deviceBreakdown) {
      deviceObj[d.device] = d.count;
    }

    // Browser breakdown format: { Chrome: 60, Firefox: 20, ... }
    const browserObj = {};
    for (const b of browserBreakdown) {
      browserObj[b.browser] = b.count;
    }

    // Compute average time on site (approximate using session data)
    let avgTimeOnSite = null;
    if (range !== 'today' && range !== '24h') {
      const sessionData = db.prepare(`
        SELECT AVG(last_heartbeat - started_at) as avg_duration
        FROM sessions
        WHERE started_at > ? AND last_heartbeat > started_at
      `).get(startMs);
      if (sessionData && sessionData.avg_duration !== null) {
        avgTimeOnSite = Math.round(sessionData.avg_duration / 1000);
      }
    }

    res.json({
      realtime: {
        active_visitors: activeVisitors?.count || 0,
        page_views_today: viewsToday?.count || 0,
      },
      overview: {
        total_page_views: totalViews?.count || 0,
        unique_visitors: totalVisitors?.count || 0,
        avg_time_on_site_seconds: avgTimeOnSite,
      },
      time_series: timeSeries || [],
      top_pages: topPages || [],
      top_countries: topCountries || [],
      top_referrers: topReferrers || [],
      device_breakdown: deviceObj,
      browser_breakdown: browserObj,
      feature_usage: featureUsage || [],
      hourly_activity: hourlyArray,
      registrations: registrations || [],
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================================
// GET /api/health — Health check
// ============================================================
app.get('/api/health', (req, res) => {
  const db = getDb();
  let eventsToday = 0;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const row = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE timestamp > ?"
    ).get(todayStart.getTime());
    eventsToday = row?.count || 0;
  } catch {
    // DB may not have data yet
  }

  res.json({
    status: 'ok',
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    events_today: eventsToday,
    version: '1.0.0',
  });
});

// ============================================================
// Schedule daily aggregation (run at midnight UTC)
// ============================================================
function scheduleAggregation() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 5, 0, 0); // 00:05 UTC next day
  const delay = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    runAggregation();
    // Re-schedule every 24 hours
    setInterval(runAggregation, 24 * 60 * 60 * 1000);
  }, delay);

  console.log(`Next aggregation scheduled for ${tomorrow.toISOString()}`);
}

// ============================================================
// Start server
// ============================================================
app.listen(PORT, () => {
  console.log(`Analytics server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Events API: POST http://localhost:${PORT}/api/events`);
  console.log(`Stats API: GET http://localhost:${PORT}/api/stats?range=7d`);

  // Schedule daily aggregation
  scheduleAggregation();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down analytics server...');
  const { close } = require('./db');
  close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down analytics server...');
  const { close } = require('./db');
  close();
  process.exit(0);
});

// Handle uncaught errors gracefully
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
