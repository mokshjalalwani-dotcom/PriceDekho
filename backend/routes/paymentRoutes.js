import express from 'express';
import { createSession, getSession, submitSession, getAdminPayments, adminVerifyPayment, deleteAdminPayment } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/session', createSession);
router.get('/session/:id', getSession);
router.post('/session/:id/submit', submitSession);

router.get('/admin', protect, admin, getAdminPayments);
router.patch('/admin/:id/verify', protect, admin, adminVerifyPayment);
router.delete('/admin/:id', protect, admin, deleteAdminPayment);

export default router;
