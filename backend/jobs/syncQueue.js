import { Queue, Worker } from 'bullmq';
import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import { runGoogleSheetSync } from '../services/sync/googleSheetSyncService.js';

export const syncQueue = new Queue('syncQueue', {
  connection: redisClient,
});

export const initSyncWorker = () => {
  if (!redisClient) {
    logger.warn('Sync Worker skipped: Redis is not available');
    return;
  }

  const worker = new Worker('syncQueue', async (job) => {
    logger.info(`Processing sync job ${job.id}...`);
    const { sheetReference, triggerSource } = job.data;
    
    const result = await runGoogleSheetSync({ sheetReference, triggerSource, dryRun: false });
    return result;
  }, { connection: redisClient });

  worker.on('completed', (job, result) => {
    logger.info(`Sync job ${job.id} completed. Inserted: ${result.summary.inserted}, Affected: ${result.summary.affected}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Sync job ${job.id} failed: ${err.message}`);
  });
};
