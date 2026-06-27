import { parseSheet }                             from './sheetParser.service.js';
import { preloadCategories, preloadBrands }       from './categoryResolver.service.js';
import { validateRow }                            from './validation.service.js';
import { upsertProducts }                         from './productUpsert.service.js';
import { createSyncLog }                          from './syncLogger.service.js';
import { acquireSyncLock, releaseSyncLock }       from './externalSyncTrigger.service.js';
import Product                                    from '../../models/Product.js';

export const runGoogleSheetSync = async ({ sheetReference, triggerSource, dryRun = false }) => {
  const startTime = Date.now();
  const errors    = [];

  let totalRows     = 0;
  let insertedCount = 0;
  let affectedCount = 0; // products whose stored data was genuinely changed
  let failedCount   = 0;

  const previousStates = [];

  if (!acquireSyncLock()) {
    return {
      success: false,
      dryRun,
      message: 'A sync process is already running. Please try again later.',
    };
  }

  try {
    // 1. Fetch & Parse
    const rows = await parseSheet(sheetReference);
    totalRows  = rows.length;

    // 2. Preload lookup maps
    await preloadCategories();
    await preloadBrands();

    // 3. Validate
    const validRows = [];
    rows.forEach((row, index) => {
      const rowErrors = validateRow(row, index);
      if (rowErrors.length > 0) {
        failedCount++;
        errors.push({
          row: index + 1,
          modelNumber: row.modelnumber || 'UNKNOWN',
          reason: rowErrors.join(', '),
          details: row,
        });
      } else {
        validRows.push(row);
      }
    });

    // 4. Upsert (or dry-run preview)
    if (!dryRun) {
      const BATCH_SIZE = 200;
      for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
        const batch        = validRows.slice(i, i + BATCH_SIZE);
        const modelNumbers = batch.map(r => r.modelnumber).filter(Boolean);

        // Rollback snapshots
        const existingProducts = await Product.find({ modelNumber: { $in: modelNumbers } }).lean();
        const existingMap      = new Map(existingProducts.map(p => [p.modelNumber, p]));
        for (const row of batch) {
          previousStates.push(
            existingMap.has(row.modelnumber)
              ? { modelNumber: row.modelnumber, wasInserted: false, data: existingMap.get(row.modelnumber) }
              : { modelNumber: row.modelnumber, wasInserted: true,  data: null }
          );
        }

        const { inserted, affected } = await upsertProducts(batch, existingMap);
        insertedCount += inserted;
        affectedCount += affected;
      }
    } else {
      // Dry-run: report what would happen without writing anything
      const BATCH_SIZE = 500;
      for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
        const batch = validRows.slice(i, i + BATCH_SIZE);
        const modelNumbers = batch.map(r => r.modelnumber).filter(Boolean);
        const existingInDB = await Product.find({ modelNumber: { $in: modelNumbers } })
                                          .lean()
                                          .select('modelNumber');
        const existingSet  = new Set(existingInDB.map(p => p.modelNumber));
        for (const row of batch) {
          if (existingSet.has(row.modelnumber)) affectedCount++; // would-be update
          else                                  insertedCount++; // would-be insert
        }
      }
    }

    const durationMs = Date.now() - startTime;

    const logData = {
      triggerSource,
      sheetReference,
      totalRows,
      insertedCount,
      affectedCount,
      failedCount,
      durationMs,
      errors: errors.slice(0, 500), // Cap at 500 errors to prevent BSON overflow
      snapshots: { 
        inputRows: validRows.slice(0, 500), 
        previousStates: previousStates.slice(0, 500),
        truncated: validRows.length > 500 
      },
    };

    if (!dryRun) await createSyncLog(logData);

    return { success: true, dryRun, ...logData };

  } catch (error) {
    const durationMs = Date.now() - startTime;
    const logData = {
      triggerSource,
      sheetReference,
      totalRows,
      insertedCount: 0,
      affectedCount: 0,
      failedCount:   totalRows > 0 ? totalRows : 1,
      durationMs,
      errors: [{ row: 0, sku: 'FATAL', reason: error.message, details: {} }],
    };
    if (!dryRun) await createSyncLog(logData);
    return { success: false, dryRun, ...logData };

  } finally {
    releaseSyncLock();
  }
};
