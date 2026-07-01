import express from 'express';
import rateLimit from 'express-rate-limit';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, clearAllOrders, deleteOrderById } from '../controllers/orderController.js';
import { razorpayWebhook } from '../controllers/webhookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict rate limit for order creation to prevent spam orders
const orderCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many orders placed. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for order detail viewing
const orderViewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/webhook', razorpayWebhook);                                   // Payment Webhook
router.post('/', orderCreateLimiter, createOrder);                          // Guest checkout (rate limited)
router.get('/', protect, admin, getAllOrders);                               // Admin: all orders
router.get('/:id', orderViewLimiter, getOrderById);                         // Get order by ID (rate limited)
router.put('/:id/status', protect, admin, updateOrderStatus);               // Admin: update status
router.delete('/', protect, admin, clearAllOrders);                         // Admin: clear all orders
router.delete('/:id', protect, admin, deleteOrderById);                     // Admin: delete an order

export default router;
