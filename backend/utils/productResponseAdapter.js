/**
 * Safely adapters Product documents to match the shape expected by existing frontend consumers.
 * Hides sync-only fields (like SKU) so the frontend remains completely isolated from
 * the Google Sheets sync implementation details.
 */

export const adaptProductForFrontend = (product) => {
  if (!product) return product;
  // Handle mongoose document vs plain object
  const productObj = product.toObject ? product.toObject() : product;

  // Clone to avoid mutating original
  const safeProduct = { ...productObj };

  // Strip sync-specific fields
  delete safeProduct.sku;
  
  return safeProduct;
};

export const adaptProductsListForFrontend = (products) => {
  if (!Array.isArray(products)) return products;
  return products.map(adaptProductForFrontend);
};
