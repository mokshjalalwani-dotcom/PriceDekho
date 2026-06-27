import express from 'express';
import { runSync, dryRunSync, getSyncLogs, clearSyncLogs, externalRunSync, handleReplaySync, handleRollbackSync, handleSkuIntegrityCheck, handleGetSyncStatus } from '../controllers/syncController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Strict rate limit for sync routes to prevent abuse
// Max 10 sync runs per 15 minutes per IP
const syncRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: 'Too many sync requests from this IP, please try again after 15 minutes.'
});

// All sync routes are protected by admin auth
router.post('/google-sheets/run', protect, admin, syncRateLimiter, runSync);
router.post('/google-sheets/dry-run', protect, admin, syncRateLimiter, dryRunSync);
router.get('/logs', protect, admin, getSyncLogs);
router.delete('/logs', protect, admin, clearSyncLogs);
router.post('/replay/:id', protect, admin, handleReplaySync);
router.post('/rollback/:id', protect, admin, handleRollbackSync);
router.post('/sku-integrity', protect, admin, handleSkuIntegrityCheck);
router.get('/status', protect, admin, handleGetSyncStatus);

// External trigger route (public, protected by secret in headers/query)
router.post('/google-sheets/external-run', syncRateLimiter, externalRunSync);

export default router;
