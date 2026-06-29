import Category from '../../models/Category.js';
import Brand from '../../models/Brand.js';
import { fuzzyMatch } from './categoryFuzzyMatcher.service.js';

let categoryMap = null;
let brandMap = null;

export const preloadCategories = async () => {
  try {
    const categories = await Category.find({}).lean();
    categoryMap = {};
    for (const cat of categories) {
      // Map lowercase trimmed name to an object with id and slug
      categoryMap[cat.name.trim().toLowerCase()] = { id: cat._id.toString(), slug: cat.slug };
    }
  } catch (error) {
    console.error('Failed to preload categories:', error);
    throw new Error('Category preloading failed');
  }
};

export const resolveCategory = (categoryName) => {
  if (!categoryMap) {
    throw new Error('Categories must be preloaded before resolution');
  }
  const match = fuzzyMatch(categoryName, categoryMap);
  // fuzzyMatch wraps the map value inside match.id — extract it so we return { id, slug } directly
  return match ? match.id : null;
};

export const preloadBrands = async () => {
  try {
    const brands = await Brand.find({}).lean();
    brandMap = {};
    for (const b of brands) {
      brandMap[b.name.trim().toLowerCase()] = b._id.toString();
    }
  } catch (error) {
    console.error('Failed to preload brands:', error);
    throw new Error('Brand preloading failed');
  }
};

export const resolveBrand = (brandName) => {
  if (!brandMap) {
    throw new Error('Brands must be preloaded before resolution');
  }
  const match = fuzzyMatch(brandName, brandMap);
  return match ? match.id : null;
};
