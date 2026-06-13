/**
 * Simple in-memory rate limiter.
 * Tracks request counts per IP within a sliding window.
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.clients = new Map();
  }

  /**
   * Returns { allowed, retryAfterMs } for the given IP.
   */
  check(ip) {
    const now = Date.now();
    let record = this.clients.get(ip);

    if (!record || now - record.windowStart > this.windowMs) {
      record = { windowStart: now, count: 0 };
      this.clients.set(ip, record);
    }

    record.count++;

    // Cleanup old entries periodically
    if (this.clients.size > 10000) {
      this._cleanup(now);
    }

    if (record.count > this.maxRequests) {
      const retryAfterMs = this.windowMs - (now - record.windowStart);
      return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
    }

    return { allowed: true, retryAfterMs: 0 };
  }

  _cleanup(now) {
    for (const [ip, record] of this.clients.entries()) {
      if (now - record.windowStart > this.windowMs * 2) {
        this.clients.delete(ip);
      }
    }
  }
}

module.exports = RateLimiter;
