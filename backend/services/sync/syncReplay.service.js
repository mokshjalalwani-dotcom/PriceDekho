import SyncLog from '../../models/SyncLog.js';
import { upsertProducts } from './productUpsert.service.js';
import { runGoogleSheetSync } from './googleSheetSyncService.js';
import Product from '../../models/Product.js';

/**
 * Replays a historic sync log exactly as it occurred,
 * using the snapshot rows stored in the log.
 */
export const replaySync = async (syncId) => {
  const log = await SyncLog.findById(syncId);
  if (!log) {
    throw new Error('Sync log not found');
  }

  if (!log.snapshots || !log.snapshots.inputRows || log.snapshots.inputRows.length === 0) {
    throw new Error('Cannot replay this sync: no input snapshots were stored.');
  }

  // We have the raw input rows, we can just run the upsert logic again
  const validRows = log.snapshots.inputRows;
  let insertedCount = 0;
  let updatedCount = 0;
  
  // Process in batches
  const BATCH_SIZE = 200;
  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    const { inserted, updated } = await upsertProducts(batch);
    insertedCount += inserted;
    updatedCount += updated;
  }

  return { insertedCount, updatedCount };
};

/**
 * Rolls back a historic sync.
 * Restores products to their exact state before the sync occurred.
 */
export const rollbackSync = async (syncId) => {
  const log = await SyncLog.findById(syncId);
  if (!log) {
    throw new Error('Sync log not found');
  }

  if (!log.snapshots || !log.snapshots.previousStates || log.snapshots.previousStates.length === 0) {
    throw new Error('Cannot rollback this sync: no previous state snapshots were stored.');
  }

  const previousStates = log.snapshots.previousStates;
  const bulkOps = [];

  for (const oldState of previousStates) {
    // Fallback to sku if modelNumber is missing (for older logs)
    const identifierFilter = oldState.modelNumber ? { modelNumber: oldState.modelNumber } : { sku: oldState.sku };

    if (oldState.wasInserted) {
      // If it was inserted by this sync, rollback means we delete it
      bulkOps.push({
        deleteOne: { filter: identifierFilter }
      });
    } else {
      // It was updated, so we revert it
      const restoreData = { ...oldState.data };
      delete restoreData._id; // Safety
      bulkOps.push({
        updateOne: {
          filter: identifierFilter,
          update: { $set: restoreData }
        }
      });
    }
  }

  let result = null;
  if (bulkOps.length > 0) {
    result = await Product.bulkWrite(bulkOps, { ordered: false });
  }

  return {
    restoredCount: result ? result.modifiedCount : 0,
    deletedCount: result ? result.deletedCount : 0
  };
};
