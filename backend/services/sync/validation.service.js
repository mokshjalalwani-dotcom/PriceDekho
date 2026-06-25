import { resolveCategory, resolveBrand } from './categoryResolver.service.js';
import mongoose from 'mongoose';

export const validateRow = (row, rowIndex) => {
  const errors = [];

  // modelnumber is required as unique identifier
  if (!row.modelnumber || row.modelnumber.toString().trim() === '') {
    errors.push('ModelNumber is required');
  }

  // name (optional for updates)
  if (row.name && row.name.toString().trim() !== '') {
    // valid
  }

  // price > 0 numeric (optional for updates)
  if (row.sellingprice || row.price) {
    const price = Number(row.sellingprice || row.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Price must be a number greater than 0');
    }
  }

  // category exists after resolution (optional for updates)
  if (row.category && row.category.toString().trim() !== '') {
    const resolvedCategory = resolveCategory(row.category);
    if (!resolvedCategory) {
      errors.push(`Category "${row.category}" could not be resolved`);
    } else {
      row._resolvedCategory = resolvedCategory;
    }
  }

  // valid imageUrl (if present)
  if (row.imageurl) {
    try {
      new URL(row.imageurl);
    } catch (e) {
      errors.push('imageUrl is not a valid URL');
    }
  }

  // stock is numeric if present
  if (row.stock !== undefined && row.stock !== '') {
    const stock = Number(row.stock);
    if (isNaN(stock) || stock < 0) {
      errors.push('Stock must be a non-negative number');
    }
  }

  // Check if brand is valid (optional for updates)
  if (row.brand && row.brand.toString().trim() !== '') {
    const resolvedBrand = resolveBrand(row.brand);
    if (!resolvedBrand) {
      errors.push(`Brand "${row.brand}" could not be resolved`);
    } else {
      row._resolvedBrand = resolvedBrand;
    }
  }

  return errors;
};
