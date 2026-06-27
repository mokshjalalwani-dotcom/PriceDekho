import express from 'express';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, clearAllOrders, deleteOrderById } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder);                                    // Guest checkout
router.get('/', protect, admin, getAllOrders);                    // Admin: all orders
router.get('/:id', getOrderById);                                 // Get order by ID
router.put('/:id/status', protect, admin, updateOrderStatus);    // Admin: update status
router.delete('/', protect, admin, clearAllOrders);               // Admin: clear all orders
router.delete('/:id', protect, admin, deleteOrderById);           // Admin: delete an order

export default router;
