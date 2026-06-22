import Brand from '../models/Brand.js';

// @desc    Fetch all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
  try {
    const filter = req.query.all ? {} : { isActive: true };
    const brands = await Brand.find(filter).sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
