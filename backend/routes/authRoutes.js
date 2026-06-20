import express from 'express';
import { authAdmin, registerCustomer, loginCustomer } from '../controllers/authController.js';

const router = express.Router();

// Admin login (mounted at /api/admin)
router.post('/login', authAdmin);

export default router;

// Customer auth router (mounted at /api/auth)
export const customerAuthRouter = express.Router();
customerAuthRouter.post('/register', registerCustomer);
customerAuthRouter.post('/login', loginCustomer);
