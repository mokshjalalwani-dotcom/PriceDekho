import logger from '../utils/logger.js';

/**
 * Production-grade in-memory response cache middleware.
 *
 * Features:
 *  - TTL-based expiration per route
 *  - LRU eviction when max entries exceeded
 *  - Only caches GET requests with 200 status
 *  - Skips caching for authenticated / admin requests
 *  - Cache-Control headers on cached responses
 *  - Programmatic invalidation via invalidateCache()
 *  - Periodic stale-entry cleanup (every 60s)
 *  - Memory-safe: hard cap on entry count
 */

const MAX_ENTRIES = 500;

// Map<string, { body, statusCode, headers, expiry, lastAccessed }>
const store = new Map();

// ── Periodic cleanup of expired entries (every 60 seconds) ──────────────
const CLEANUP_INTERVAL_MS = 60 * 1000;
setInterval(() => {
  const now = Date.now();
  let purged = 0;
  for (const [key, entry] of store) {
    if (entry.expiry <= now) {
      store.delete(key);
      purged++;
    }
  }
  if (purged > 0) {
    logger.info(`[Cache] Purged ${purged} expired entries. Store size: ${store.size}`);
  }
}, CLEANUP_INTERVAL_MS).unref(); // .unref() so the timer doesn't prevent process exit

// ── LRU eviction ────────────────────────────────────────────────────────
function evictLRU() {
  if (store.size <= MAX_ENTRIES) return;

  // Find the least-recently-accessed entry
  let oldestKey = null;
  let oldestAccess = Infinity;
  for (const [key, entry] of store) {
    if (entry.lastAccessed < oldestAccess) {
      oldestAccess = entry.lastAccessed;
      oldestKey = key;
    }
  }
  if (oldestKey) {
    store.delete(oldestKey);
  }
}

// ── Build cache key from method + originalUrl ───────────────────────────
function buildKey(req) {
  // originalUrl includes path + query string, which is exactly what we need
  return `${req.method}:${req.originalUrl}`;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Express middleware factory.
 * @param {number} durationSeconds – how long to cache the response
 * @returns {Function} Express middleware
 *
 * Usage in routes:
 *   router.get('/products', cache(60), getProducts);
 */
export const cache = (durationSeconds) => {
  return (req, res, next) => {
    // 1. Only cache GET requests
    if (req.method !== 'GET') return next();

    // 2. Skip caching for authenticated / admin requests
    if (req.headers.authorization) return next();

    const key = buildKey(req);

    // 3. Check for a cache hit
    const cached = store.get(key);
    if (cached && cached.expiry > Date.now()) {
      cached.lastAccessed = Date.now();
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `public, max-age=${durationSeconds}`);
      // Restore the original content-type
      if (cached.headers['content-type']) {
        res.set('Content-Type', cached.headers['content-type']);
      }
      return res.status(cached.statusCode).send(cached.body);
    }

    // 4. Cache miss – intercept res.send() to store the response
    const originalSend = res.send.bind(res);

    res.send = (body) => {
      // Only cache successful JSON responses
      if (res.statusCode === 200) {
        store.set(key, {
          body,
          statusCode: res.statusCode,
          headers: {
            'content-type': res.get('Content-Type'),
          },
          expiry: Date.now() + durationSeconds * 1000,
          lastAccessed: Date.now(),
        });
        evictLRU();
      }

      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${durationSeconds}`);
      return originalSend(body);
    };

    next();
  };
};

/**
 * Programmatically invalidate cache entries.
 *
 * @param {string|RegExp} [pattern] – If a string, deletes the exact key.
 *   If a RegExp, deletes all matching keys. If omitted, flushes everything.
 *
 * Usage:
 *   invalidateCache();                        // flush all
 *   invalidateCache('GET:/api/products');      // exact key
 *   invalidateCache(/^GET:\/api\/products/);   // all product routes
 */
export const invalidateCache = (pattern) => {
  if (!pattern) {
    const size = store.size;
    store.clear();
    logger.info(`[Cache] Flushed all ${size} entries`);
    return;
  }

  if (typeof pattern === 'string') {
    store.delete(pattern);
    return;
  }

  // RegExp
  let purged = 0;
  for (const key of store.keys()) {
    if (pattern.test(key)) {
      store.delete(key);
      purged++;
    }
  }
  if (purged > 0) {
    logger.info(`[Cache] Invalidated ${purged} entries matching ${pattern}`);
  }
};

/**
 * Returns current cache statistics (useful for health/debug endpoints).
 */
export const getCacheStats = () => ({
  entries: store.size,
  maxEntries: MAX_ENTRIES,
});
