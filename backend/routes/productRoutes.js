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

const router = express.Router();

router.route('/').get(getProducts);
router.route('/compare').get(getProductsToCompare);
router.route('/search').get(searchProducts);
router.route('/category/:slug').get(getProductsByCategory);
router.route('/id/:id').get(getProductById);
router.route('/:id/similar').get(getSimilarProducts);
router.route('/:slug').get(getProductBySlug);

export default router;
