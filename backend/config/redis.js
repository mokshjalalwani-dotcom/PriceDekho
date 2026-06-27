import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      logger.warn(Redis connection retrying ()...);
      return Math.min(times * 50, 2000);
    }
  });

  redisClient.on('error', (err) => {
    logger.error(Redis Error: );
  });

  redisClient.on('connect', () => {
    logger.info('Connected to Redis successfully');
  });
} else {
  logger.warn('REDIS_URL not provided. Running without Redis caching/queues.');
}

export default redisClient;
