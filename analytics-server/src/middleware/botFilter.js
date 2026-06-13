/**
 * Bot detection middleware.
 * Checks User-Agent, request headers, and suspicious patterns.
 */

// Known bot/crawler user-agent patterns
const BOT_PATTERNS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
  'facebot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'slackbot', 'discordbot', 'telegrambot', 'whatsapp',
  'rogerbot', 'dotbot', 'semrushbot', 'ahrefsbot', 'majestic-seo',
  'archive.org_bot', 'ia_archiver', 'gptbot', 'chatgpt-user',
  'bytespider', 'claudebot', 'anthropic-ai', 'perplexitybot',
  'cohere-ai', 'applebot', 'ccbot', 'datadogagent',
  'pingdom', 'newrelic', 'statuscake', 'uptimerobot',
  'lighthouse', 'pagespeed', 'chrome-lighthouse',
  'wappalyzer', 'nutch', 'scrapy', 'curl', 'wget',
  'python-requests', 'python-httpx', 'aiohttp', 'okhttp',
  'go-http-client', 'axios', 'node-fetch', 'fetch',
  'postman', 'insomnia', 'httpie', 'httpx',
  'java/', 'libwww', 'perl/', 'ruby', 'php',
];

// Known hosting/cloud IP ranges (simplified - just prefixes)
// These are commonly used by scrapers running on cloud VMs
const CLOUD_IP_RANGES = [
  '34.', '35.', '52.', '54.', // AWS
  '104.', '107.', '146.', // Google Cloud
  '13.', '20.', '40.',  // Azure
];

function isBot(userAgent) {
  if (!userAgent || userAgent.trim() === '') return true;

  const ua = userAgent.toLowerCase();

  // Check known bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (ua.includes(pattern)) return true;
  }

  return false;
}

function hasSuspiciousHeaders(headers) {
  // Missing critical headers that real browsers always send
  if (!headers['accept-language'] || !headers['accept-encoding']) {
    return true;
  }

  return false;
}

function isCloudIp(ip) {
  for (const prefix of CLOUD_IP_RANGES) {
    if (ip.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Middleware to detect and filter bots.
 * Returns true if the request should be blocked (is a bot).
 */
function isBotRequest(req) {
  const userAgent = req.headers['user-agent'] || '';

  if (isBot(userAgent)) return true;

  // Check for automation frameworks (client-side headers that proxies forward)
  if (req.headers['x-requested-with'] === 'xmlhttprequest' && !userAgent) {
    return true;
  }

  return false;
}

module.exports = { isBotRequest, isBot, hasSuspiciousHeaders, isCloudIp, BOT_PATTERNS };
