import express from 'express';
import { getSettings, updateSettings, getAdminSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, admin, updateSettings);

// Admin-only: returns full unfiltered settings (UPI ID, bank details, etc.)
router.get('/admin', protect, admin, getAdminSettings);

export default router;
