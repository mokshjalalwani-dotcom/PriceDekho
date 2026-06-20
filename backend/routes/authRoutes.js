import express from 'express';
import { authAdmin, registerCustomer, loginCustomer, getMe } from '../controllers/authController.js';

const router = express.Router();

// Admin login (mounted at /api/admin)
router.post('/login', authAdmin);

export default router;

import { protect } from '../middleware/authMiddleware.js';

// Customer auth router (mounted at /api/auth)
export const customerAuthRouter = express.Router();
customerAuthRouter.post('/register', registerCustomer);
customerAuthRouter.post('/login', loginCustomer);
customerAuthRouter.get('/me', protect, getMe);
