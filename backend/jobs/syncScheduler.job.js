import cron from 'node-cron';
import { runGoogleSheetSync } from '../services/sync/googleSheetSyncService.js';
import dotenv from 'dotenv';

dotenv.config();

export const initSyncScheduler = () => {
  // Check if scheduling is enabled via env var
  if (process.env.ENABLE_SHEET_SYNC_CRON !== 'true') {
    console.log('Google Sheets Sync Scheduler is disabled (ENABLE_SHEET_SYNC_CRON != true)');
    return;
  }

  const sheetUrl = process.env.SHEET_SYNC_URL;
  if (!sheetUrl) {
    console.log('Google Sheets Sync Scheduler is disabled: Missing SHEET_SYNC_URL');
    return;
  }

  // Schedule to run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Starting scheduled Google Sheets Sync...');
    try {
      const report = await runGoogleSheetSync({
        sheetReference: sheetUrl,
        triggerSource: 'scheduled',
        dryRun: false
      });
      console.log('Scheduled Sync completed:', report.status);
    } catch (error) {
      console.error('Scheduled Sync encountered a fatal error:', error);
      // We log it but NEVER crash the process
    }
  });

  console.log('Google Sheets Sync Scheduler initialized (Runs every 6 hours)');
};
