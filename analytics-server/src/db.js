const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'analytics.db');

let db;

function getDb() {
  if (!db) {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrent performance
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = -20000'); // 20MB cache

    createTables();
  }
  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_views (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id  TEXT    NOT NULL,
      user_id     TEXT,
      session_id  TEXT    NOT NULL,
      path        TEXT    NOT NULL,
      referrer    TEXT,
      title       TEXT,
      country     TEXT,
      city        TEXT,
      device_type TEXT,
      browser     TEXT,
      os          TEXT,
      screen_w    INTEGER,
      screen_h    INTEGER,
      timestamp   INTEGER NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_pv_visitor ON page_views(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_pv_timestamp ON page_views(timestamp);
    CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path);
    CREATE INDEX IF NOT EXISTS idx_pv_user ON page_views(user_id);
    CREATE INDEX IF NOT EXISTS idx_pv_country ON page_views(country);

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id  TEXT    NOT NULL,
      user_id     TEXT,
      session_id  TEXT    NOT NULL,
      event_name  TEXT    NOT NULL,
      properties  TEXT,
      path        TEXT,
      timestamp   INTEGER NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_ev_name ON events(event_name);
    CREATE INDEX IF NOT EXISTS idx_ev_visitor ON events(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_ev_timestamp ON events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_ev_user ON events(user_id);

    CREATE TABLE IF NOT EXISTS sessions (
      id              TEXT    PRIMARY KEY,
      visitor_id      TEXT    NOT NULL,
      user_id         TEXT,
      path            TEXT,
      country         TEXT,
      device_type     TEXT,
      browser         TEXT,
      os              TEXT,
      started_at      INTEGER NOT NULL,
      last_heartbeat  INTEGER NOT NULL,
      is_active       INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_sess_active ON sessions(is_active, last_heartbeat);
    CREATE INDEX IF NOT EXISTS idx_sess_visitor ON sessions(visitor_id);

    CREATE TABLE IF NOT EXISTS daily_aggregates (
      date                TEXT    PRIMARY KEY,
      page_views          INTEGER DEFAULT 0,
      unique_visitors     INTEGER DEFAULT 0,
      registrations       INTEGER DEFAULT 0,
      quizzes_created     INTEGER DEFAULT 0,
      quizzes_taken       INTEGER DEFAULT 0,
      flashcards_created  INTEGER DEFAULT 0,
      study_sessions      INTEGER DEFAULT 0,
      top_pages           TEXT,
      top_countries       TEXT,
      top_referrers       TEXT,
      device_breakdown    TEXT,
      browser_breakdown   TEXT,
      hourly_breakdown    TEXT,
      created_at          TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS geo_cache (
      ip          TEXT    PRIMARY KEY,
      country     TEXT,
      city        TEXT,
      fetched_at  INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_geo_fetched ON geo_cache(fetched_at);
  `);
}

function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, close };
