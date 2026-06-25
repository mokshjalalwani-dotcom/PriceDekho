import { parseSheet } from './sheetParser.service.js';
import { preloadCategories, preloadBrands } from './categoryResolver.service.js';
import { validateRow } from './validation.service.js';
import { upsertProducts } from './productUpsert.service.js';
import { createSyncLog } from './syncLogger.service.js';
import { acquireSyncLock, releaseSyncLock } from './externalSyncTrigger.service.js';
import Product from '../../models/Product.js';

export const runGoogleSheetSync = async ({ sheetReference, triggerSource, dryRun = false }) => {
  const startTime = Date.now();
  const errors = [];
  let totalRows = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const previousStates = [];

  // Attempt to acquire lock
  if (!acquireSyncLock()) {
    return {
      success: false,
      dryRun,
      message: 'A sync process is already running. Please try again later.'
    };
  }

  try {
    // 1. Fetch and Parse Sheet
    const rows = await parseSheet(sheetReference);
    totalRows = rows.length;

    // 2. Preload Maps
    await preloadCategories();
    await preloadBrands();

    const validRows = [];

    // 3. Validate Rows
    rows.forEach((row, index) => {
      const rowErrors = validateRow(row, index);
      if (rowErrors.length > 0) {
        failedCount++;
        errors.push({
          row: index + 1, // 1-indexed for user readability
          modelNumber: row.modelnumber || 'UNKNOWN',
          reason: rowErrors.join(', '),
          details: row
        });
      } else {
        validRows.push(row);
      }
    });

    // 4. Batch Upsert if not dryRun
    if (!dryRun) {
      const BATCH_SIZE = 200;
      for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
        const batch = validRows.slice(i, i + BATCH_SIZE);
        
        // Take snapshot before upserting
        const modelNumbers = batch.map(r => r.modelnumber).filter(m => m);
        const existingProducts = await Product.find({ modelNumber: { $in: modelNumbers } }).lean();
        const existingMap = new Map(existingProducts.map(p => [p.modelNumber, p]));

        for (const row of batch) {
          if (existingMap.has(row.modelnumber)) {
            previousStates.push({
              modelNumber: row.modelnumber,
              wasInserted: false,
              data: existingMap.get(row.modelnumber)
            });
          } else {
            previousStates.push({
              modelNumber: row.modelnumber,
              wasInserted: true,
              data: null
            });
          }
        }

        const { inserted, updated } = await upsertProducts(batch);
        insertedCount += inserted;
        updatedCount += updated;
      }
    } else {
      // In dry run, valid rows are just 'skipped' writes
      skippedCount = validRows.length;
    }

    const durationMs = Date.now() - startTime;

    // 5. Log Result
    const logData = {
      triggerSource,
      sheetReference,
      totalRows,
      insertedCount,
      updatedCount,
      failedCount,
      skippedCount,
      durationMs,
      errors,
      snapshots: {
        inputRows: validRows,
        previousStates
      }
    };

    if (!dryRun) {
      await createSyncLog(logData);
    }

    return {
      success: true,
      dryRun,
      ...logData
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    
    // Log fatal error
    const logData = {
      triggerSource,
      sheetReference,
      totalRows,
      insertedCount: 0,
      updatedCount: 0,
      failedCount: totalRows > 0 ? totalRows : 1,
      skippedCount: 0,
      durationMs,
      errors: [{ row: 0, sku: 'FATAL', reason: error.message, details: {} }]
    };

    if (!dryRun) {
      await createSyncLog(logData);
    }

    return {
      success: false,
      dryRun,
      ...logData
    };
  } finally {
    releaseSyncLock();
  }
};
