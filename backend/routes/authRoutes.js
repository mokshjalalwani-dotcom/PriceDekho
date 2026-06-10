import express from 'express';
import { authAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authAdmin);

export default router;
