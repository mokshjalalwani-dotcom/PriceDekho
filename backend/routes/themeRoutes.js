import express from 'express';
import { getTheme, updateTheme } from '../controllers/themeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTheme)
  .put(protect, admin, updateTheme);

export default router;
