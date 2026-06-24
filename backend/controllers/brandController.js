import Brand from '../models/Brand.js';

// @desc    Fetch all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
  try {
    const filter = req.query.all ? {} : { isActive: true };
    
    if (req.query.category) {
      if (req.query.childCategory) {
        // Must match category AND the specific child category
        filter.mappedCategories = {
          $elemMatch: {
            category: req.query.category,
            childCategories: req.query.childCategory
          }
        };
      } else {
        // Just match the category
        filter.mappedCategories = {
          $elemMatch: {
            category: req.query.category
          }
        };
      }
    }
    
    const brands = await Brand.find(filter).sort({ name: 1 }).populate('mappedCategories.category', 'name slug');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
