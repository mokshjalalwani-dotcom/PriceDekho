import SyncLog from '../../models/SyncLog.js';

export const createSyncLog = async (logData) => {
  try {
    const {
      triggerSource,
      sheetReference,
      totalRows,
      insertedCount,
      updatedCount,
      failedCount,
      skippedCount,
      durationMs,
      errors,
      snapshots
    } = logData;

    let status = 'success';
    if (failedCount > 0 && (insertedCount > 0 || updatedCount > 0)) {
      status = 'partial_success';
    } else if (failedCount > 0 && insertedCount === 0 && updatedCount === 0) {
      status = 'failed';
    }

    const duration = `${(durationMs / 1000).toFixed(2)}s`;

    const log = new SyncLog({
      triggerSource,
      sheetReference,
      totalRows,
      insertedCount,
      updatedCount,
      failedCount,
      skippedCount,
      durationMs,
      duration,
      status,
      errors,
      snapshots
    });

    await log.save();

    // Prune old logs to keep only the 5 most recent
    try {
      const logsToKeep = await SyncLog.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id')
        .lean();

      if (logsToKeep.length === 5) {
        const keepIds = logsToKeep.map(l => l._id);
        await SyncLog.deleteMany({ _id: { $nin: keepIds } });
      }
    } catch (pruneError) {
      console.error('Error pruning sync logs:', pruneError);
    }

    return log;
  } catch (error) {
    console.error('Error saving sync log:', error);
    // Don't throw - we don't want a logging failure to break the execution reporting
    return null;
  }
};
