import Brand from '../models/Brand.js';
import Category from '../models/Category.js';

/**
 * Validates that a Brand exists, a Category exists, and the Brand is mapped to the Category.
 * @param {String} brandId - The ObjectId of the Brand
 * @param {String} categoryId - The ObjectId of the Category
 * @returns {Promise<Object>} - { isValid: boolean, error: string }
 */
export const validateBrandCategory = async (brandId, categoryId) => {
  try {
    if (!brandId || !categoryId) {
      return { isValid: false, error: 'Brand ID and Category ID are required for validation.' };
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return { isValid: false, error: `Brand with ID ${brandId} not found.` };
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return { isValid: false, error: `Category with ID ${categoryId} not found.` };
    }

    const isMapped = brand.categories.some(c => c.toString() === categoryId.toString());
    if (!isMapped) {
      console.warn(`[VALIDATION FAILED] Attempted to map Brand '${brand.name}' to Category '${category.name}', but they are not linked in the database.`);
      return { isValid: false, error: `Brand '${brand.name}' is not mapped to the selected category '${category.name}'.` };
    }

    return { isValid: true, error: null };
  } catch (error) {
    console.error('Error in validateBrandCategory:', error);
    return { isValid: false, error: 'Internal server error during brand validation.' };
  }
};
