import logger from '../utils/logger.js';

let redisClient = null;

if (process.env.REDIS_URL) {
  try {
    const Redis = (await import('ioredis')).default;
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        logger.warn(`Redis connection retrying (attempt ${times})...`);
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis Error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis successfully');
    });
  } catch (err) {
    logger.warn(`Redis client unavailable: ${err.message}`);
    redisClient = null;
  }
} else {
  logger.warn('REDIS_URL not provided. Running without Redis caching/queues.');
}

export default redisClient;
