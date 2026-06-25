import Product from '../../models/Product.js';
import { convertToNLC } from '../../utils/nlcConverter.js';

export const upsertProducts = async (validRows) => {
  if (validRows.length === 0) return { inserted: 0, updated: 0 };

  const bulkOps = validRows.map(row => {
    const knownKeys = ['sku', 'name', 'sellingprice', 'price', 'mrp', 'category', 'brand', 'imageurl', 'stock', 'modelnumber', 'color', 'subcategory', 'childcategory', '_resolvedCategory', '_resolvedBrand', 'nlc', 'additionalcontent', 'highlights', 'keyhighlights', 'shortdescription'];
    
    const categoryFields = {};
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (!knownKeys.includes(lowerKey) 
          && !lowerKey.startsWith('nlc') 
          && !lowerKey.includes('highlight') 
          && !lowerKey.includes('color') 
          && !lowerKey.includes('warranty')
          && !(lowerKey.includes('short') && lowerKey.includes('desc'))
          && !(lowerKey.includes('full') && lowerKey.includes('desc'))
          && !lowerKey.includes('box')
          && row[key] !== '') {
        categoryFields[key] = row[key];
      }
    }

    const updateDoc = {};
    const setOnInsertDoc = {};

    // Only add fields if they exist and are not empty
    if (row.name && row.name !== '') {
      updateDoc.name = row.name;
      setOnInsertDoc.slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
    }
    
    if (row.sellingprice || row.price) {
      const sellingPrice = Number(row.sellingprice || row.price);
      if (sellingPrice > 0) {
        updateDoc.sellingPrice = sellingPrice;
        updateDoc.price = sellingPrice;
      }
    }

    if (row.mrp && row.mrp !== '') {
      updateDoc.mrp = Number(row.mrp);
    }
    
    if (updateDoc.mrp > 0 && updateDoc.sellingPrice > 0 && updateDoc.mrp > updateDoc.sellingPrice) {
      updateDoc.discountPercentage = Math.round(((updateDoc.mrp - updateDoc.sellingPrice) / updateDoc.mrp) * 100);
    }

    if (row._resolvedCategory) updateDoc.category = row._resolvedCategory;
    if (row._resolvedBrand) updateDoc.brand = row._resolvedBrand;

    if (row.stock !== undefined && row.stock !== '') {
      const countInStock = Number(row.stock);
      updateDoc.countInStock = countInStock;
      updateDoc.availability = countInStock <= 0 ? 'Out of Stock' : 'In Stock';
    }

    if (row.imageurl && row.imageurl !== '') {
      updateDoc.mainImage = row.imageurl;
      updateDoc.images = [row.imageurl];
    }
    
    // row.modelnumber maps to sku internally but we can also set the modelNumber field if the schema supports it
    if (row.modelnumber && row.modelnumber !== '') updateDoc.modelNumber = row.modelnumber;
    
    // Find Color dynamically
    const colorKey = Object.keys(row).find(k => k.toLowerCase().includes('color') || k.toLowerCase() === 'colour');
    if (colorKey && row[colorKey] !== '') updateDoc.color = row[colorKey];

    // Find Highlights dynamically
    const highlightKey = Object.keys(row).find(k => k.toLowerCase().includes('highlight'));
    if (highlightKey && row[highlightKey] !== '') {
      updateDoc.highlights = row[highlightKey].split(',').map(h => h.trim()).filter(h => h);
    }
    
    // Find Warranty Details
    const warrantyKey = Object.keys(row).find(k => k.toLowerCase().includes('warranty'));
    if (warrantyKey && row[warrantyKey] !== '') updateDoc.warrantyDetails = row[warrantyKey];

    // Find Short Description
    const shortDescKey = Object.keys(row).find(k => k.toLowerCase().includes('short') && k.toLowerCase().includes('desc'));
    if (shortDescKey && row[shortDescKey] !== '') updateDoc.shortDescription = row[shortDescKey];

    // Find Full Description
    const fullDescKey = Object.keys(row).find(k => k.toLowerCase().includes('full') && k.toLowerCase().includes('desc'));
    if (fullDescKey && row[fullDescKey] !== '') updateDoc.fullDescription = row[fullDescKey];

    // Find Box Contents
    const boxContentsKey = Object.keys(row).find(k => k.toLowerCase().includes('box'));
    if (boxContentsKey && row[boxContentsKey] !== '') {
      updateDoc.boxContents = row[boxContentsKey].split(',').map(h => h.trim()).filter(h => h);
    }

    if (row.subcategory && row.subcategory !== '') updateDoc.subCategory = row.subcategory;
    if (row.childcategory && row.childcategory !== '') updateDoc.childCategory = row.childcategory;
    
    // Map NLC column to additionalContent by finding any key that starts with 'nlc'
    let nlcValue = row.additionalcontent;
    if (!nlcValue) {
      const nlcKey = Object.keys(row).find(k => k.startsWith('nlc'));
      if (nlcKey) nlcValue = row[nlcKey];
    }
    
    if (nlcValue !== undefined && nlcValue !== '') {
      updateDoc.additionalContent = convertToNLC(String(nlcValue));
    }
    
    if (Object.keys(categoryFields).length > 0) {
      updateDoc.categoryFields = categoryFields;
    }

    return {
      updateOne: {
        filter: { modelNumber: row.modelnumber },
        update: { 
          $set: updateDoc,
          $setOnInsert: setOnInsertDoc
        },
        upsert: !!row.name // Only insert new products if a name is provided, otherwise it's strictly an update
      }
    };
  });

  try {
    const result = await Product.bulkWrite(bulkOps, { ordered: false });
    return {
      inserted: result.upsertedCount || 0,
      updated: result.modifiedCount || 0
    };
  } catch (error) {
    console.error('Bulk write error:', error);
    throw new Error('Database bulk write failed');
  }
};
