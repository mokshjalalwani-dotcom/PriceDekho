import express from 'express';
import { getBrands } from '../controllers/brandController.js';

const router = express.Router();

router.route('/').get(getBrands);

export default router;
