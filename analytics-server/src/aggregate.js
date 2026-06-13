/**
 * Daily aggregation script.
 * Computes daily_aggregates from raw page_views and events for the previous day.
 * Can be run via cron or setInterval.
 *
 * Usage: node src/aggregate.js
 * Or schedule: 0 5 * * * cd /path/to/analytics-server && node src/aggregate.js >> /var/log/analytics-aggregate.log 2>&1
 */
const { getDb } = require('./db');

function runAggregation() {
  const db = getDb();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const dayStart = new Date(dateStr + 'T00:00:00.000Z').getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  console.log(`[${new Date().toISOString()}] Running daily aggregation for ${dateStr}...`);

  try {
    // Page views count
    const pageViews = db.prepare(
      'SELECT COUNT(*) as count FROM page_views WHERE timestamp >= ? AND timestamp < ?'
    ).get(dayStart, dayEnd);

    // Unique visitors
    const uniqueVisitors = db.prepare(
      'SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE timestamp >= ? AND timestamp < ?'
    ).get(dayStart, dayEnd);

    // Registrations
    const registrations = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE event_name = 'user_registered' AND timestamp >= ? AND timestamp < ?"
    ).get(dayStart, dayEnd);

    // Quizzes created
    const quizzesCreated = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE event_name = 'quiz_created' AND timestamp >= ? AND timestamp < ?"
    ).get(dayStart, dayEnd);

    // Quizzes taken
    const quizzesTaken = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE event_name = 'quiz_completed' AND timestamp >= ? AND timestamp < ?"
    ).get(dayStart, dayEnd);

    // Flashcards created
    const flashcardsCreated = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE event_name = 'flashcard_created' AND timestamp >= ? AND timestamp < ?"
    ).get(dayStart, dayEnd);

    // Study sessions
    const studySessions = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE event_name LIKE 'study_session_%' AND timestamp >= ? AND timestamp < ?"
    ).get(dayStart, dayEnd);

    // Top pages
    const topPages = db.prepare(`
      SELECT path, COUNT(*) as count FROM page_views
      WHERE timestamp >= ? AND timestamp < ?
      GROUP BY path ORDER BY count DESC LIMIT 10
    `).all(dayStart, dayEnd);

    // Top countries
    const topCountries = db.prepare(`
      SELECT country, COUNT(DISTINCT visitor_id) as count FROM page_views
      WHERE timestamp >= ? AND timestamp < ? AND country IS NOT NULL
      GROUP BY country ORDER BY count DESC LIMIT 10
    `).all(dayStart, dayEnd);

    // Top referrers
    const topReferrers = db.prepare(`
      SELECT 
        CASE 
          WHEN referrer IS NULL OR referrer = '' THEN 'direct'
          WHEN referrer LIKE '%google.%' THEN 'Google'
          ELSE 'other'
        END as source,
        COUNT(*) as count
      FROM page_views
      WHERE timestamp >= ? AND timestamp < ?
      GROUP BY source ORDER BY count DESC
    `).all(dayStart, dayEnd);

    // Device breakdown
    const deviceData = db.prepare(`
      SELECT device_type, COUNT(*) as count FROM page_views
      WHERE timestamp >= ? AND timestamp < ? AND device_type IS NOT NULL
      GROUP BY device_type
    `).all(dayStart, dayEnd);

    // Browser breakdown
    const browserData = db.prepare(`
      SELECT browser, COUNT(*) as count FROM page_views
      WHERE timestamp >= ? AND timestamp < ? AND browser IS NOT NULL
      GROUP BY browser
    `).all(dayStart, dayEnd);

    // Hourly breakdown
    const hourlyData = db.prepare(`
      SELECT CAST(strftime('%H', timestamp / 1000, 'unixepoch') AS INTEGER) as hour, COUNT(*) as count
      FROM page_views
      WHERE timestamp >= ? AND timestamp < ?
      GROUP BY hour ORDER BY hour
    `).all(dayStart, dayEnd);

    const hourlyArray = Array(24).fill(0);
    for (const h of hourlyData) {
      if (h.hour >= 0 && h.hour < 24) hourlyArray[h.hour] = h.count;
    }

    const deviceObj = {};
    for (const d of deviceData) deviceObj[d.device_type] = d.count;

    const browserObj = {};
    for (const b of browserData) browserObj[b.browser] = b.count;

    // Upsert into daily_aggregates
    db.prepare(`
      INSERT INTO daily_aggregates (
        date, page_views, unique_visitors, registrations,
        quizzes_created, quizzes_taken, flashcards_created, study_sessions,
        top_pages, top_countries, top_referrers,
        device_breakdown, browser_breakdown, hourly_breakdown
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        page_views = excluded.page_views,
        unique_visitors = excluded.unique_visitors,
        registrations = excluded.registrations,
        quizzes_created = excluded.quizzes_created,
        quizzes_taken = excluded.quizzes_taken,
        flashcards_created = excluded.flashcards_created,
        study_sessions = excluded.study_sessions,
        top_pages = excluded.top_pages,
        top_countries = excluded.top_countries,
        top_referrers = excluded.top_referrers,
        device_breakdown = excluded.device_breakdown,
        browser_breakdown = excluded.browser_breakdown,
        hourly_breakdown = excluded.hourly_breakdown
    `).run(
      dateStr,
      pageViews?.count || 0,
      uniqueVisitors?.count || 0,
      registrations?.count || 0,
      quizzesCreated?.count || 0,
      quizzesTaken?.count || 0,
      flashcardsCreated?.count || 0,
      studySessions?.count || 0,
      JSON.stringify(topPages),
      JSON.stringify(topCountries),
      JSON.stringify(topReferrers),
      JSON.stringify(deviceObj),
      JSON.stringify(browserObj),
      JSON.stringify(hourlyArray)
    );

    // Prune stale sessions (no heartbeat > 60 min)
    const staleThreshold = Date.now() - 60 * 60 * 1000;
    const prunedSessions = db.prepare(
      'UPDATE sessions SET is_active = 0 WHERE last_heartbeat < ? AND is_active = 1'
    ).run(staleThreshold);

    console.log(`[${new Date().toISOString()}] Aggregation complete for ${dateStr}.`);
    console.log(`  Page views: ${pageViews?.count || 0}`);
    console.log(`  Unique visitors: ${uniqueVisitors?.count || 0}`);
    console.log(`  Registrations: ${registrations?.count || 0}`);
    console.log(`  Stale sessions pruned: ${prunedSessions.changes}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Aggregation error:`, err);
  }
}

// Run if executed directly
if (require.main === module) {
  runAggregation();
} else {
  module.exports = { runAggregation };
}
