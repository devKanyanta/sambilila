# Analytics System — Specification

## 1. Overview

Build a self-hosted, server-side analytics system for Lernopia that captures site visits, feature-level user events, and displays rich visualizations in a dedicated admin panel. **No third-party analytics services** (Google Analytics, Plausible, etc.) are used.

---

## 2. Architecture

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│   Next.js App (Netlify)  │         │   Analytics API Server       │
│                          │         │   (VPS / long-running)       │
│  ┌───────────────────┐   │  HTTP   │  ┌────────────────────────┐ │
│  │ analytics.js (client) │◄──────────►│  POST /api/events       │ │
│  │   - fingerprint       │   POST   │  │  (receive + record)    │ │
│  │   - page views        │          │  └────────────────────────┘ │
│  │   - feature events    │          │  ┌────────────────────────┐ │
│  └───────────────────┘   │          │  │  GET /api/stats        │ │
│                          │          │  │  (aggregate queries)   │ │
│  ┌───────────────────┐   │   FETCH  │  └────────────────────────┘ │
│  │ Server-side APIs   │   │◄────────►│  ┌────────────────────────┐ │
│  │ (/.netlify/functions) │  POST/GET │  │  SQLite (analytics.db) │ │
│  └───────────────────┘   │          │  └────────────────────────┘ │
└─────────────────────────┘         └──────────────────────────────┘
```

### 2.1 Separation of Concerns

- **Main app (Netlify serverless):** Handles auth, content, payments — no analytics data stored here.
- **Analytics server (VPS):** A lightweight Node.js/Express (or Fastify) server running persistently. Accepts events from the main app, stores them in SQLite, serves aggregated stats to the admin dashboard.
- **Client-side analytics module:** A standalone JS file loaded in the root layout that handles browser fingerprinting, page view tracking, and event emission.

### 2.2 Rationale

- SQLite cannot persist in Netlify's serverless environment (ephemeral filesystem).
- Decoupling analytics prevents bloat in the main database and keeps analytics code independent.
- Self-hosted on a VPS keeps costs at $0 (just compute, which you may already have).

---

## 3. Data Model (SQLite Schema)

### 3.1 `page_views` — Page visit events

```sql
CREATE TABLE page_views (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id  TEXT    NOT NULL,       -- browser fingerprint hash
    user_id     TEXT,                   -- authenticated user ID (nullable for anonymous)
    session_id  TEXT    NOT NULL,       -- session UUID (rotated every 30min idle)
    path        TEXT    NOT NULL,       -- e.g., '/dashboard/quiz'
    referrer    TEXT,                   -- document.referrer
    title       TEXT,                   -- document.title
    country     TEXT,                   -- ISO country code from ipapi/ipwhois
    city        TEXT,                   -- city name
    device_type TEXT,                   -- 'desktop' | 'tablet' | 'mobile'
    browser     TEXT,                   -- browser name
    os          TEXT,                   -- OS name
    screen_w    INTEGER,               -- screen width
    screen_h    INTEGER,               -- screen height
    timestamp   INTEGER NOT NULL,       -- UNIX milliseconds
    created_at  TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX idx_pv_visitor ON page_views(visitor_id);
CREATE INDEX idx_pv_timestamp ON page_views(timestamp);
CREATE INDEX idx_pv_path ON page_views(path);
CREATE INDEX idx_pv_user ON page_views(user_id);
CREATE INDEX idx_pv_country ON page_views(country);
```

### 3.2 `events` — Feature-level user actions

```sql
CREATE TABLE events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id  TEXT    NOT NULL,
    user_id     TEXT,
    session_id  TEXT    NOT NULL,
    event_name  TEXT    NOT NULL,         -- see §3.3 for values
    properties  TEXT,                     -- JSON string with event-specific data
    path        TEXT,                     -- page where event occurred
    timestamp   INTEGER NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX idx_ev_name ON events(event_name);
CREATE INDEX idx_ev_visitor ON events(visitor_id);
CREATE INDEX idx_ev_timestamp ON events(timestamp);
CREATE INDEX idx_ev_user ON events(user_id);
```

### 3.3 Tracked Event Names

| Event Name | Properties | Trigger |
|---|---|---|
| `page_view` | `path`, `title`, `referrer` | On every page load / route change |
| `session_start` | — | New session created |
| `session_end` | `duration_seconds` | Session idle timeout (30min) |
| `quiz_created` | `quiz_id`, `subject`, `num_questions` | Quiz generated from notes |
| `quiz_completed` | `quiz_id`, `score`, `total` | Quiz result submitted |
| `flashcard_created` | `set_id`, `subject`, `num_cards` | Flashcard set generated |
| `study_session_started` | `session_id`, `type` | Study session begins |
| `study_session_ended` | `session_id`, `duration`, `cards_studied` | Study session ends |
| `user_registered` | — | Account created |
| `user_login` | — | User logs in |
| `subscription_action` | `action` (upgrade/downgrade/cancel), `plan` | Subscription changed |
| `file_uploaded` | `file_type`, `file_size_bytes` | File upload completed |
| `content_shared` | `content_type` (quiz/flashcard), `id` | Share link generated |
| `search_performed` | `query`, `scope` | Search/filter used in dashboard |

### 3.4 `sessions` — Active sessions for real-time tracking

```sql
CREATE TABLE sessions (
    id              TEXT    PRIMARY KEY,
    visitor_id      TEXT    NOT NULL,
    user_id         TEXT,
    path            TEXT,                   -- current/last page
    country         TEXT,
    device_type     TEXT,
    browser         TEXT,
    os              TEXT,
    started_at      INTEGER NOT NULL,       -- UNIX ms
    last_heartbeat  INTEGER NOT NULL,       -- UNIX ms
    is_active       INTEGER DEFAULT 1
);

CREATE INDEX idx_sess_active ON sessions(is_active, last_heartbeat);
CREATE INDEX idx_sess_visitor ON sessions(visitor_id);
```

### 3.5 `daily_aggregates` — Pre-computed daily summaries (for performance)

```sql
CREATE TABLE daily_aggregates (
    date            TEXT    PRIMARY KEY,    -- 'YYYY-MM-DD'
    page_views      INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    registrations   INTEGER DEFAULT 0,
    quizzes_created INTEGER DEFAULT 0,
    quizzes_taken   INTEGER DEFAULT 0,
    flashcards_created INTEGER DEFAULT 0,
    study_sessions  INTEGER DEFAULT 0,
    top_pages       TEXT,                   -- JSON: [{path, count}]
    top_countries   TEXT,                   -- JSON: [{country, count}]
    top_referrers   TEXT,                   -- JSON: [{referrer, count}]
    device_breakdown TEXT,                  -- JSON: {desktop: N, mobile: N, tablet: N}
    browser_breakdown TEXT,                 -- JSON: {chrome: N, firefox: N, ...}
    hourly_breakdown TEXT,                  -- JSON: [0..23 hour counts]
    created_at      TEXT DEFAULT (datetime('now'))
);
```

---

## 4. Client-Side Analytics (`analytics.js`)

### 4.1 Responsibilities

- Generate and persist a **visitor fingerprint** in localStorage
- Manage **session** lifecycle (start, heartbeat, end on idle)
- Track **page views** (SPA-compatible — intercepts route changes)
- Emit **feature events** via a global API (`window.__analytics.track(...)`)
- Send events to the analytics server via `POST /api/events`
- Batch events and flush every 5 seconds (or immediately for sessions)

### 4.2 Browser Fingerprinting

Generate a deterministic hash from these browser properties:
- User agent
- Screen resolution (`screen.width x screen.height x screen.colorDepth`)
- Timezone offset
- Language (`navigator.language`)
- Platform (`navigator.platform`)
- Available fonts (via `document.fonts` check on ~10 common fonts)
- Canvas fingerprint (draw a hidden image, hash the pixel data)

Combine into a SHA-256 hash stored in localStorage as `__analytics_visitor_id`.

### 4.3 Session Management

- Generate a UUID v4 session ID on first load
- Send a heartbeat every 60 seconds while the page is open
- If no heartbeat for 30 minutes, mark session as ended server-side
- New page load = new heartbeat, same session

### 4.4 SPA Route Change Detection

- Listen for `popstate` events
- Patch `pushState` and `replaceState` to detect client-side navigation
- On route change, fire a `page_view` event with the new path/title

### 4.5 API

```js
// Public API available on `window.__analytics`
window.__analytics = {
  // Track a feature event
  track: (eventName, properties = {}) => { ... },

  // Identify authenticated user (call after login/registration)
  identify: (userId) => { ... },

  // Manually trigger a page view
  pageView: (path, title) => { ... },
}
```

### 4.6 Bot/Exclusion Filtering (Client-side)

Before sending any event, check:
- `navigator.webdriver` is null/false (blocks Selenium, Puppeteer, Playwright)
- `navigator.doNotTrack` is not explicitly set (optional)
- Screen dimensions are reasonable (not 0x0 or 1x1)
- `navigator.userAgent` not empty
- No presence of automation frameworks (check `window.__webdriver`, `window.callPhantom`, etc.)

---

## 5. Analytics Server (VPS - Node.js/Express)

### 5.1 Endpoints

#### `POST /api/events`
Accept a batch of events from the client.

**Request body:**
```json
{
  "visitor_id": "abc123...",
  "user_id": "clx...",          // nullable
  "session_id": "uuid-...",
  "events": [
    {
      "name": "page_view",
      "properties": { "path": "/dashboard/quiz", "title": "Quiz Generator" },
      "timestamp": 1718000000000
    },
    ...
  ]
}
```

**Response:** `200 OK`

**Server-side processing:**
1. Validate the event payload
2. Run bot detection on the request IP (see §5.3)
3. Extract country from IP (see §5.4)
4. Batch-insert into SQLite (use transactions for perf)
5. Update the session heartbeat
6. Return 200 immediately (fire-and-forget for the client)

#### `GET /api/stats?range=7d`
Return aggregated stats. Used by the admin dashboard.

**Query params:**
- `range`: `today` | `24h` | `7d` | `30d` | `all` | `custom_start=...&custom_end=...`

**Response:**
```json
{
  "realtime": {
    "active_visitors": 12,
    "page_views_today": 342
  },
  "overview": {
    "total_page_views": 50000,
    "unique_visitors": 3200,
    "avg_time_on_site_seconds": 180
  },
  "time_series": [
    { "date": "2026-06-07", "page_views": 1200, "visitors": 340 },
    ...
  ],
  "top_pages": [
    { "path": "/", "views": 12000 },
    { "path": "/dashboard", "views": 8500 },
    ...
  ],
  "top_countries": [
    { "country": "US", "visitors": 1500 },
    { "country": "ZM", "visitors": 800 },
    ...
  ],
  "top_referrers": [
    { "source": "direct", "visits": 20000 },
    { "source": "google.com", "visits": 5000 },
    ...
  ],
  "device_breakdown": {
    "desktop": 55,
    "mobile": 40,
    "tablet": 5
  },
  "browser_breakdown": {
    "Chrome": 60,
    "Firefox": 20,
    "Safari": 15,
    "Other": 5
  },
  "feature_usage": [
    { "event": "quiz_created", "count": 450 },
    { "event": "flashcard_created", "count": 380 },
    ...
  ],
  "hourly_activity": [0, 0, 0, 0, 2, 5, 15, 45, 120, ...],
  "registrations": [
    { "date": "2026-06-07", "count": 12 },
    ...
  ]
}
```

#### `GET /api/health`
Health check endpoint. Returns `{ "status": "ok", "uptime": 12345, "events_today": 500 }`.

### 5.2 Rate Limiting & Bot Filtering (Server-side)

- **IP-based rate limiting:** Max 100 events per minute per IP (using in-memory LRU cache)
- **User-Agent filtering:** Reject known bot/ crawler patterns (Googlebot, Bingbot, ChatGPT-User, Bytespider, etc.)
- **Request pattern analysis:** Reject requests that:
  - Hit >10 paths/sec (scraper pattern)
  - Have suspicious timing (all events at exactly the same ms)
  - Missing critical headers (`Accept-Language`, `Accept-Encoding`)
  - Known hosting IP ranges (AWS, GCP, Azure — scrapers)
- **Rate limit response:** Return `429 Too Many Requests` with `Retry-After` header, but do NOT 4xx for tracking requests — silently drop instead to avoid breaking the main app.

### 5.3 IP Geolocation

Use the same approach as the existing `app/api/location/route.ts`:
1. Primary: `ipapi.co/{ip}/json/` (free, 1000 req/day)
2. Fallback: `ipwho.is/{ip}` (free, 10,000 req/month)
3. Cache results in a small SQLite table to avoid hitting rate limits on repeated IPs

### 5.4 Aggregation Job (Cron)

A daily cron job runs at 00:05 UTC that:
1. Computes `daily_aggregates` from raw `page_views` and `events` for the previous day
2. Deletes raw page views older than the configured retention (if retention is set)
3. Prunes stale sessions (no heartbeat > 60 min)
4. Outputs a summary log

This can run as a simple `setInterval` within the analytics server or a separate CRON script.

### 5.5 Tech Stack

| Component | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js or Fastify (lightweight) |
| Database | better-sqlite3 (synchronous, fast, zero config) |
| HTTP client for geo | native `fetch` (Node 20+) |
| Auth | Shared JWT secret with main app for admin API |
| Deploy | $5-10 VPS (DigitalOcean, Linode, Hetzner, or Oracle free tier) |
| Process manager | PM2 (auto-restart) |

---

## 6. Admin Dashboard Integration

### 6.1 New Page: `/dashboard/admin/analytics`

A new tab/route in the admin section with:

#### 6.1.1 Page Header
- Title: "Analytics"
- Subtitle: "Site traffic, feature usage, and user behavior"
- Time range selector: "Today" | "Last 7 days" | "Last 30 days" | "All time"
- Real-time indicator showing "12 visitors now" with a pulsing green dot

#### 6.1.2 Realtime Widget (top of page)
- Active visitors count (sessions with heartbeat in last 5 min)
- Page views today
- Refreshes every 30 seconds

#### 6.1.3 Overview Cards Row
- **Total Page Views** (with trend arrow vs previous period)
- **Unique Visitors**
- **Avg. Time on Site**
- **Bounce Rate**

#### 6.1.4 Charts Section (2-column grid)

**Top row:**
- **Page Views & Visitors Over Time** — Area chart (dual axis: views + unique visitors, daily for 7d/30d, cumulative)
- **Hourly Activity** — Bar chart (24 hours, showing peak usage times)

**Middle row:**
- **Top Pages** — Horizontal bar chart (path + view count)
- **Visitor Geography** — Vertical bar chart (country + visitor count)

**Bottom row:**
- **Traffic Sources** — Pie/donut chart (direct, organic, referral, social, other)
- **Device Breakdown** — Pie/donut chart (desktop, mobile, tablet)
- **Browser Breakdown** — Pie/donut chart
- **Feature Usage** — Horizontal bar chart (event name + count)

#### 6.1.5 User Acquisition Section
- Area chart showing new registrations over time
- Below the chart, a table with daily registration counts

### 6.2 API Proxy

The admin dashboard calls the analytics server via a server-side proxy to avoid exposing the analytics server URL to the client:

```
app/api/admin/analytics/route.ts
```

This route:
1. Verifies admin auth (same as other admin routes)
2. Proxies the request to the analytics server (e.g., `http://analytics-vps:3001/api/stats?range=7d`)
3. Returns the response to the client

### 6.3 Admin Dashboard Nav Update

Add an "Analytics" nav item (with `BarChart3` icon) after "Admin" in the admin nav section. Only visible to admin users.

### 6.4 Error/Offline Handling

If the analytics server is unreachable, display a banner:
> "Analytics data is temporarily unavailable. The tracking server may be offline."

Show cached/stale data if available, or empty states with graceful null/zero values.

---

## 7. Implementation Phases

### Phase 1: Analytics Server (Days 1-3)
- [ ] Set up Express/Fastify server with SQLite
- [ ] Implement event ingestion endpoint (`POST /api/events`)
- [ ] Implement stats query endpoint (`GET /api/stats`)
- [ ] Set up rate limiting and bot filtering
- [ ] Implement IP geolocation integration (ipapi.co + ipwho.is)
- [ ] Set up daily aggregation cron job
- [ ] Health check endpoint

### Phase 2: Client-Side Tracking (Days 3-5)
- [ ] Create `public/js/analytics.js` with fingerprinting, session management
- [ ] Integrate into `app/layout.tsx` (load the script)
- [ ] Implement SPA route change detection
- [ ] Implement event batching and flush
- [ ] Add `window.__analytics` public API
- [ ] Add tracking calls to existing code (quiz created, flashcard created, etc.)

### Phase 3: Admin Dashboard UI (Days 5-7)
- [ ] Create `app/dashboard/admin/analytics/page.tsx`
- [ ] Create admin analytics API proxy route
- [ ] Build all chart components (reusing Recharts patterns from existing admin)
- [ ] Implement real-time polling (30s refresh)
- [ ] Time range selector
- [ ] Offline/error states

### Phase 4: Integration & Polish (Days 7-8)
- [ ] Add server-side bot filtering to analytics server
- [ ] Test end-to-end flow
- [ ] Add event tracking to all existing feature flows
- [ ] Deploy analytics server to VPS
- [ ] Document deployment and configuration

---

## 8. Configuration & Environment Variables

### Main App (.env.local)
```
ANALYTICS_SERVER_URL=http://analytics-vps:3001
```

### Analytics Server (.env)
```
PORT=3001
JWT_SECRET=<shared-with-main-app>
DATABASE_PATH=./data/analytics.db
IPAPI_API_KEY=                     # optional, free tier works without key
ADMIN_EMAIL=<admin-email>
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

---

## 9. Constraints & Edge Cases

| Constraint | Handling |
|---|---|
| **Serverless (Netlify)** | Analytics runs on a separate long-running server. Main app only makes HTTP calls. |
| **Free tier only** | No paid analytics services. SQLite + free geo IP APIs. VPS can be Oracle free tier or low-cost. |
| **Bot traffic** | Aggressive filtering: client-side detection + server-side U.A. filtering + rate limiting + request pattern analysis. |
| **Privacy** | No personal data stored (fingerprint is hashed, not reversible). IP not stored except transiently for geo lookup. |
| **High traffic** | Batching (client flushes every 5s), batch inserts on server, pre-computed daily aggregates for dashboard queries. |
| **SPA routing** | Patches `pushState`/`popstate` to track client-side navigation without full page reloads. |
| **Offline analytics server** | Admin dashboard shows graceful error state. Client-side events buffer (up to 50 events) and retry. |
| **Data growth** | Indefinite raw retention but daily aggregates support fast queries. If storage becomes an issue, raw data can be pruned. |

---

## 10. Design Patterns & Code Conventions

- **Charts:** Use existing `recharts` library (already in project). Follow pattern of existing admin chart components (`UserGrowthChart.tsx`, `RevenueChart.tsx`, etc.).
- **Animations:** Use `framer-motion` with existing animation variants from `app/dashboard/animations.ts`.
- **Styling:** Tailwind CSS with the project's existing color palette (`primary-500: #ff5252`, `neutral-*` grays, etc.).
- **Naming:** Follow existing conventions (PascalCase components, camelCase functions/hooks, `useXxx` for hooks).
- **Page structure:** Follow the same pattern as `app/dashboard/admin/AdminDashboardContent.tsx` — a main content component with a `useAnalyticsDashboard` hook.

---

## 11. Future Considerations (Out of Scope for v1)

- Export data as CSV/PDF
- Custom event definitions via admin UI
- A/B testing support
- Funnel analysis (e.g., "users who visit → register → create quiz")
- UTM parameter tracking for marketing campaigns
- Email reports (weekly analytics digest)
