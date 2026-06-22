import Category from '../models/Category.js';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const filter = req.query.all ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ displayOrder: 1 });
    
    // Sort subcategories by displayOrder
    const sortedCategories = categories.map(cat => {
      const catObj = cat.toObject();
      if (catObj.subCategories && catObj.subCategories.length > 0) {
        // If they are objects, sort by displayOrder
        if (typeof catObj.subCategories[0] === 'object') {
          catObj.subCategories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
      }
      return catObj;
    });

    res.json(sortedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
