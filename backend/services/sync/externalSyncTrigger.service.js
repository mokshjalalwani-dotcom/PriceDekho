let isSyncRunning = false;
let lastExternalTriggerTime = null;

/**
 * Attempts to acquire the sync lock.
 * Returns true if acquired, false if a sync is already running.
 */
export const acquireSyncLock = () => {
  if (isSyncRunning) {
    return false;
  }
  isSyncRunning = true;
  return true;
};

/**
 * Releases the sync lock.
 */
export const releaseSyncLock = () => {
  isSyncRunning = false;
};

/**
 * Gets current lock status.
 */
export const getSyncStatus = () => {
  return {
    isRunning: isSyncRunning,
    lastExternalTriggerTime
  };
};

/**
 * Validates the external webhook secret.
 */
export const validateWebhookSecret = (req) => {
  const secret = process.env.SYNC_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Server configuration error: SYNC_WEBHOOK_SECRET is not set.');
  }

  // Support secret in headers (X-Sync-Secret) or query param (?secret=)
  const providedSecret = req.headers['x-sync-secret'] || req.query.secret;

  if (!providedSecret || providedSecret !== secret) {
    return false;
  }
  
  lastExternalTriggerTime = new Date().toISOString();
  return true;
};
