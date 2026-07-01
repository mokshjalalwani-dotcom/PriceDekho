import express from 'express';
import rateLimit from 'express-rate-limit';
import { createSession, getSession, submitSession, getAdminPayments, adminVerifyPayment, deleteAdminPayment } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict rate limits for public-facing payment routes
const sessionCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many payment sessions created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const sessionViewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const sessionSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many submission attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/session', sessionCreateLimiter, createSession);
router.get('/session/:id', sessionViewLimiter, getSession);
router.post('/session/:id/submit', sessionSubmitLimiter, submitSession);

router.get('/admin', protect, admin, getAdminPayments);
router.patch('/admin/:id/verify', protect, admin, adminVerifyPayment);
router.delete('/admin/:id', protect, admin, deleteAdminPayment);

export default router;
