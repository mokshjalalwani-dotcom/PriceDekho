import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';

export const cache = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (!redisClient) return next();
    if (req.method !== 'GET') return next();

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Hijack res.json to save cache
      const originalJson = res.json;
      res.json = (body) => {
        redisClient.setex(key, ttlSeconds, JSON.stringify(body)).catch(err => {
          logger.error(`Redis Cache Set Error: ${err.message}`);
        });
        originalJson.call(res, body);
      };
      next();
    } catch (error) {
      logger.error(`Redis Cache Get Error: ${error.message}`);
      next();
    }
  };
};
