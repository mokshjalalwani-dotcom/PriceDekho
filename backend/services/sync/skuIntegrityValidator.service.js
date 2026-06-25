import Product from '../../models/Product.js';

/**
 * Scans all products to check for missing ModelNumbers or duplicate ModelNumbers.
 * Auto-repair is disabled because ModelNumber is a user-facing field.
 */
export const scanAndRepairSKUs = async ({ autoRepair = false } = {}) => {
  const report = {
    totalProducts: 0,
    missingSkuCount: 0,
    duplicateSkuCount: 0,
    repairedCount: 0, // kept for UI compatibility
    errors: [],
    status: 'healthy'
  };

  try {
    const products = await Product.find({}, '_id modelNumber').lean();
    report.totalProducts = products.length;

    const skuMap = new Map();
    
    for (const product of products) {
      if (!product.modelNumber || product.modelNumber.trim() === '') {
        report.missingSkuCount++;
      } else {
        const skuStr = product.modelNumber.toString();
        if (skuMap.has(skuStr)) {
          report.duplicateSkuCount++;
          report.errors.push(`Duplicate ModelNumber detected: ${skuStr} for product ${product._id}`);
        } else {
          skuMap.set(skuStr, product._id);
        }
      }
    }

    if (report.missingSkuCount > 0 || report.duplicateSkuCount > 0) {
      report.status = 'issues_detected';
    }

    return report;
  } catch (error) {
    console.error('SKU Integrity check failed:', error);
    report.status = 'error';
    report.errors.push(error.message);
    return report;
  }
};
