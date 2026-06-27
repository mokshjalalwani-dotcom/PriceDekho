// Cache middleware - graceful no-op when Redis is unavailable.
// When Redis is configured, this will cache responses for the given TTL.
// When Redis is not available, requests pass through without caching.

const redisUrl = process.env.REDIS_URL;
let redisClient = null;

if (redisUrl) {
  try {
    const { createClient } = await import('redis');
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) => console.warn('Redis cache error:', err.message));
    await redisClient.connect();
    console.log('Redis cache middleware connected.');
  } catch (err) {
    console.warn('Redis cache middleware unavailable:', err.message);
    redisClient = null;
  }
}

export const cache = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    // If Redis is not available, skip caching entirely
    if (!redisClient || !redisClient.isReady) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      // Redis read failed, proceed without cache
      return next();
    }

    // Store original res.json to intercept the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Cache the response asynchronously (fire-and-forget)
      if (redisClient && redisClient.isReady) {
        redisClient.setEx(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
};

export const invalidateCache = async (pattern) => {
  if (!redisClient || !redisClient.isReady) return;
  try {
    const keys = await redisClient.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.warn('Cache invalidation error:', err.message);
  }
};
