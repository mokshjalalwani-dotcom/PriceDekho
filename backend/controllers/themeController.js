import Theme from '../models/Theme.js';

// @desc    Get current theme
// @route   GET /api/theme
// @access  Public
export const getTheme = async (req, res) => {
  try {
    let theme = await Theme.findOne({ isActive: true });
    
    // If no theme exists, create a default one
    if (!theme) {
      theme = await Theme.create({});
    }
    
    res.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ message: 'Server error while fetching theme' });
  }
};

// @desc    Update theme settings
// @route   PUT /api/theme
// @access  Private/Admin
export const updateTheme = async (req, res) => {
  try {
    let theme = await Theme.findOne({ isActive: true });
    
    if (!theme) {
      theme = new Theme(req.body);
    } else {
      // Update existing theme with new values
      Object.assign(theme, req.body);
    }
    
    await theme.save();
    res.json(theme);
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Server error while updating theme' });
  }
};
