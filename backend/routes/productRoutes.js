import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  getProductsToCompare,
  getSimilarProducts,
  getProductsByCategory,
  searchProducts,
} from '../controllers/productController.js';

import { cache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.route('/').get(cache(60), getProducts); // Cache for 60s
router.route('/compare').get(cache(300), getProductsToCompare); // 5 mins
router.route('/search').get(cache(60), searchProducts);
router.route('/category/:slug').get(cache(60), getProductsByCategory);
router.route('/id/:id').get(getProductById);
router.route('/:id/similar').get(cache(300), getSimilarProducts);
router.route('/:slug').get(getProductBySlug);

export default router;
