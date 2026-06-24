import express from 'express';
import Subcategory from '../models/Subcategory.js';

const router = express.Router();

// GET /api/subcategories
// Fetch active subcategories, optionally filtered by category
router.get('/', async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const subcategories = await Subcategory.find(filter)
      .populate('category', 'name slug')
      .sort({ displayOrder: 1 });
      
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
