import Category from '../models/Category.js';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const filter = req.query.all ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
