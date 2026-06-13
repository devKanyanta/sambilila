/**
 * Lernopia Analytics — Self-hosted client-side tracking
 *
 * Features:
 * - Browser fingerprinting (canvas + font + property based)
 * - Session management with heartbeats
 * - SPA route change detection
 * - Event batching with periodic flush
 * - Bot detection
 *
 * Usage:
 *   window.__analytics.track('quiz_created', { quiz_id: '...', subject: 'Math' });
 *   window.__analytics.identify('user-id-123');
 *   window.__analytics.pageView('/dashboard', 'Dashboard');
 */

(function () {
  'use strict';

  // ============================================================
  // Configuration
  // ============================================================
  const CONFIG = {
    // Analytics server endpoint — set via data-endpoint attribute on script tag
    endpoint: '/api/events',
    flushIntervalMs: 5000,        // Flush events every 5 seconds
    heartbeatIntervalMs: 60000,   // Send heartbeat every 60 seconds
    maxBatchSize: 25,             // Max events per batch
    maxBufferSize: 50,            // Max buffered events before forced flush
    sessionTimeoutMs: 1800000,    // 30 minutes idle timeout
  };

  // Override endpoint from script tag data attribute
  const scripts = document.getElementsByTagName('script');
  for (const script of scripts) {
    const ep = script.getAttribute('data-endpoint');
    if (ep) {
      CONFIG.endpoint = ep;
      break;
    }
  }

  // ============================================================
  // Browser Fingerprinting
  // ============================================================
  const VISITOR_ID_KEY = '__analytics_visitor_id';

  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(100, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.font = '11pt Arial';
      ctx.fillText('Lernopia™', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = '18pt Georgia';
      ctx.fillText('analytics', 4, 45);

      // Add a circle
      ctx.beginPath();
      ctx.arc(150, 30, 15, 0, Math.PI * 2, true);
      ctx.fillStyle = '#ff5252';
      ctx.fill();

      return canvas.toDataURL();
    } catch {
      return '';
    }
  }

  function getFontFingerprint() {
    const testFonts = [
      'monospace', 'sans-serif', 'serif',
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
      'Courier New', 'Verdana', 'Trebuchet MS', 'Impact',
      'Comic Sans MS', 'Lucida Console', 'Tahoma',
    ];
    const testString = 'mmnniioo01';
    const testSize = '72px';
    const baseFont = 'monospace';

    // Create a hidden element to measure font rendering
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.visibility = 'hidden';
    el.style.fontSize = testSize;
    el.style.whiteSpace = 'nowrap';
    document.body.appendChild(el);

    const baseWidths = {};
    el.style.fontFamily = baseFont;
    el.textContent = testString;
    const baseWidth = el.offsetWidth;

    const detectedFonts = [];
    for (const font of testFonts) {
      el.style.fontFamily = `'${font}', ${baseFont}`;
      if (el.offsetWidth !== baseWidth) {
        detectedFonts.push(font);
      }
    }

    document.body.removeChild(el);
    return detectedFonts.join(',');
  }

  function getFingerprint() {
    try {
      const components = [
        navigator.userAgent || '',
        screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.language || '',
        navigator.platform || '',
        getCanvasFingerprint(),
        getFontFingerprint(),
      ];

      const raw = components.join('|||');
      return simpleHash(raw);
    } catch {
      // Fallback: use a random ID if fingerprinting fails
      let id = localStorage.getItem(VISITOR_ID_KEY);
      if (!id) {
        id = 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VISITOR_ID_KEY, id);
      }
      return id;
    }
  }

  // Simple SHA-256 approximation using SubtleCrypto
  async function simpleHash(str) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback if crypto is unavailable
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return 'fp_' + Math.abs(hash).toString(36) + '_' + str.length;
    }
  }

  function getOrCreateVisitorId() {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      // Generate fingerprint asynchronously, but return a temp ID immediately
      const tempId = 'tmp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      getFingerprint().then(fp => {
        localStorage.setItem(VISITOR_ID_KEY, fp);
        // Update the visitor ID in the next flush
        state.visitorId = fp;
      });
      id = tempId;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  }

  // ============================================================
  // Bot Detection (Client-side)
  // ============================================================
  function isBot() {
    try {
      // Check for automation frameworks
      if (navigator.webdriver) return true;
      if (window.__webdriver) return true;
      if (window.callPhantom) return true;
      if (window._phantom) return true;
      if (window.__nightmare) return true;
      if (window.__selenium) return true;
      if (document.__selenium) return true;
      if (window.domAutomation) return true;
      if (window.domAutomationController) return true;

      // Check for Puppeteer
      if (navigator.plugins && navigator.plugins.length === 0) {
        // Headless Chrome often has 0 plugins — but so do some real browsers
        // Combine with other checks
      }

      // Check for empty/non-standard user agent
      if (!navigator.userAgent || navigator.userAgent === '') return true;

      // Check screen dimensions
      if (screen.width === 0 || screen.height === 0) return true;
      if (screen.width <= 1 || screen.height <= 1) return true;

      // Chrome headless detection
      if (navigator.userAgent.includes('HeadlessChrome')) return true;

      return false;
    } catch {
      return false;
    }
  }

  // ============================================================
  // Session Management
  // ============================================================
  function generateUUID() {
    try {
      return crypto.randomUUID();
    } catch {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  }

  const SESSION_ID_KEY = '__analytics_session_id';
  const SESSION_START_KEY = '__analytics_session_start';

  function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    const sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY)) || 0;
    const now = Date.now();

    // Create new session if none exists or timed out
    if (!sessionId || (now - sessionStart) > CONFIG.sessionTimeoutMs) {
      sessionId = generateUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      sessionStorage.setItem(SESSION_START_KEY, now.toString());

      // Track session start
      bufferEvent('session_start', {});
    }

    return sessionId;
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk|android(?!.*mobile)/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/') || ua.includes('Edge/')) return 'Edge';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Firefox/') && !ua.includes('Seamonkey/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    if (ua.includes('Trident/') || ua.includes('MSIE')) return 'Internet Explorer';
    return 'Other';
  }

  function getOS() {
    const ua = navigator.userAgent;
    if (/windows/i.test(ua)) return 'Windows';
    if (/macintosh|mac os x/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    return 'Other';
  }

  // ============================================================
  // Event Buffer & Flush
  // ============================================================
  const state = {
    visitorId: getOrCreateVisitorId(),
    userId: null,
    sessionId: getOrCreateSessionId(),
    events: [],
    lastFlush: Date.now(),
    flushTimer: null,
    heartbeatTimer: null,
    initialized: false,
  };

  function bufferEvent(name, properties = {}) {
    // Don't buffer if bot detected
    if (isBot()) return;

    state.events.push({
      name: name,
      properties: properties,
      timestamp: Date.now(),
    });

    // Force flush if buffer getting full
    if (state.events.length >= CONFIG.maxBufferSize) {
      flushEvents();
    }
  }

  async function flushEvents() {
    if (state.events.length === 0) return;

    const batch = state.events.splice(0, CONFIG.maxBatchSize);
    const payload = {
      visitor_id: state.visitorId,
      user_id: state.userId,
      session_id: state.sessionId,
      events: batch,
    };

    try {
      const response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Use keepalive to ensure events are sent even if page unloads
        keepalive: true,
      });

      if (!response.ok) {
        // Put events back in buffer on failure (except for 4xx errors)
        if (response.status >= 400 && response.status < 500) {
          // Don't retry client errors
          return;
        }
        state.events.unshift(...batch);
      }
    } catch {
      // Network error — retry on next flush
      state.events.unshift(...batch);
    }

    state.lastFlush = Date.now();
  }

  // ============================================================
  // SPA Route Change Detection
  // ============================================================
  function trackPageView(path, title) {
    bufferEvent('page_view', {
      path: path || window.location.pathname,
      title: title || document.title,
      referrer: document.referrer || '',
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screen_w: screen.width,
      screen_h: screen.height,
    });
  }

  function patchHistoryApi() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      originalPushState.apply(this, arguments);
      trackPageView();
    };

    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      trackPageView();
    };

    window.addEventListener('popstate', function () {
      trackPageView();
    });
  }

  // ============================================================
  // Heartbeat
  // ============================================================
  function sendHeartbeat() {
    bufferEvent('heartbeat', {
      path: window.location.pathname,
    });
  }

  // ============================================================
  // Initialization
  // ============================================================
  function init() {
    if (state.initialized) return;
    if (isBot()) return;

    state.initialized = true;

    // Patch SPA navigation
    patchHistoryApi();

    // Track initial page view
    trackPageView();

    // Start periodic flush
    state.flushTimer = setInterval(flushEvents, CONFIG.flushIntervalMs);

    // Start heartbeat
    state.heartbeatTimer = setInterval(sendHeartbeat, CONFIG.heartbeatIntervalMs);

    // Flush on page unload
    window.addEventListener('beforeunload', function () {
      flushEvents();
    });

    // Flush on page visibility change (tab switch → flush)
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        flushEvents();
      }
    });
  }

  // ============================================================
  // Public API
  // ============================================================
  window.__analytics = {
    /**
     * Track a feature event (quiz created, flashcard generated, etc.)
     * @param {string} eventName - Event name (e.g., 'quiz_created', 'user_registered')
     * @param {object} properties - Event-specific properties
     */
    track: function (eventName, properties = {}) {
      init();
      bufferEvent(eventName, properties);
    },

    /**
     * Identify the authenticated user.
     * Call after login/registration.
     * @param {string} userId - The user's ID
     */
    identify: function (userId) {
      if (userId) {
        state.userId = userId;
        localStorage.setItem('__analytics_user_id', userId);
      }
    },

    /**
     * Manually trigger a page view event.
     * @param {string} path - Page path (defaults to current path)
     * @param {string} title - Page title (defaults to current title)
     */
    pageView: function (path, title) {
      init();
      trackPageView(path, title);
    },

    /**
     * Flush buffered events immediately.
     */
    flush: function () {
      flushEvents();
    },

    /**
     * Initialize the analytics (called automatically, but safe to call again).
     */
    init: function () {
      init();
    },
  };

  // Restore user ID from localStorage if available
  const storedUserId = localStorage.getItem('__analytics_user_id');
  if (storedUserId) {
    state.userId = storedUserId;
  }

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
