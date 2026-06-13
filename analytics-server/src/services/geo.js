/**
 * IP Geolocation service.
 * Uses ipapi.co as primary, ipwho.is as fallback.
 * Caches results in SQLite to avoid hitting free-tier rate limits.
 */
const { getDb } = require('../db');

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Look up geolocation for an IP address.
 * Returns { country, city } or null if lookup fails.
 */
async function lookupIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost') {
    return null;
  }

  // Strip IPv6 prefix if present
  const cleanIp = ip.replace(/^::ffff:/, '');

  // Check cache first
  const cached = checkCache(cleanIp);
  if (cached) return cached;

  // Try primary provider
  try {
    const data = await tryProvider(`https://ipapi.co/${cleanIp}/json/`);
    if (data && data.country_code) {
      const result = {
        country: data.country_code.toUpperCase(),
        city: data.city || null,
      };
      saveToCache(cleanIp, result);
      return result;
    }
  } catch {
    // Fall through to fallback
  }

  // Try fallback provider
  try {
    const data = await tryProvider(`https://ipwho.is/${cleanIp}`);
    if (data && data.country_code) {
      const result = {
        country: data.country_code.toUpperCase(),
        city: data.city || null,
      };
      saveToCache(cleanIp, result);
      return result;
    }
  } catch {
    // All providers failed
  }

  return null;
}

async function tryProvider(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function checkCache(ip) {
  const db = getDb();
  const row = db.prepare(
    'SELECT country, city, fetched_at FROM geo_cache WHERE ip = ?'
  ).get(ip);

  if (row && (Date.now() - row.fetched_at) < CACHE_TTL_MS) {
    return { country: row.country, city: row.city };
  }
  return null;
}

function saveToCache(ip, data) {
  const db = getDb();
  db.prepare(
    'INSERT OR REPLACE INTO geo_cache (ip, country, city, fetched_at) VALUES (?, ?, ?, ?)'
  ).run(ip, data.country, data.city, Date.now());
}

module.exports = { lookupIp };
