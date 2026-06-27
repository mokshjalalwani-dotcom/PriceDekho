import Product from '../../models/Product.js';
import { convertToNLC } from '../../utils/nlcConverter.js';

const isEqualValue = (newVal, oldVal) => {
  if (newVal === oldVal) return true;
  if (newVal == null && oldVal == null) return true;
  if (newVal == null || oldVal == null) return false;
  
  if (typeof newVal !== 'object' || typeof oldVal !== 'object') return false;
  
  if (Array.isArray(newVal) && Array.isArray(oldVal)) {
    if (newVal.length !== oldVal.length) return false;
    for (let i = 0; i < newVal.length; i++) {
      if (!isEqualValue(newVal[i], oldVal[i])) return false;
    }
    return true;
  }
  
  if (Array.isArray(newVal) !== Array.isArray(oldVal)) return false;
  
  const newKeys = Object.keys(newVal);
  for (const k of newKeys) {
    if (!isEqualValue(newVal[k], oldVal[k])) return false;
  }
  
  return true;
};

/**
 * Builds the $set document from a validated sheet row.
 */
const buildSetDoc = (row) => {
  const doc = {};

  if (row.name && row.name !== '') doc.name = row.name.trim();

  if (row.sellingprice || row.price) {
    const sp = Number(row.sellingprice || row.price);
    if (!isNaN(sp) && sp > 0) {
      doc.sellingPrice = sp;
      doc.price = sp; // legacy alias
    }
  }

  if (row.mrp && row.mrp !== '') {
    const mrp = Number(row.mrp);
    if (!isNaN(mrp)) doc.mrp = mrp;
  }

  if (doc.mrp > 0 && doc.sellingPrice > 0 && doc.mrp > doc.sellingPrice) {
    doc.discountPercentage = Math.round(((doc.mrp - doc.sellingPrice) / doc.mrp) * 100);
  }

  if (row._resolvedCategory) {
    doc.category = row._resolvedCategory.id;
  }
  if (row._resolvedBrand) {
    doc.brand = row._resolvedBrand;
  }

  if (row.stock !== undefined && row.stock !== '') {
    const countInStock = Number(row.stock);
    if (!isNaN(countInStock)) {
      doc.countInStock  = countInStock;
      doc.availability  = countInStock <= 0 ? 'Out of Stock' : 'In Stock';
    }
  }

  if (row.imageurl && row.imageurl !== '') doc.mainImage = row.imageurl.trim();

  const youtubeKey = Object.keys(row).find(k => k.toLowerCase().includes('youtube'));
  if (youtubeKey && row[youtubeKey] !== '') doc.youtubeUrl = row[youtubeKey].trim();

  if (row.modelnumber && row.modelnumber !== '') doc.modelNumber = row.modelnumber.trim();

  const highlightKey = Object.keys(row).find(k => k.toLowerCase().includes('highlight'));
  if (highlightKey && row[highlightKey] !== '') {
    doc.highlights = row[highlightKey].split(',').map(h => h.trim()).filter(Boolean);
  }

  const shortDescKey = Object.keys(row).find(k => k.toLowerCase().includes('short') && k.toLowerCase().includes('desc'));
  if (shortDescKey && row[shortDescKey] !== '') doc.shortDescription = row[shortDescKey].trim();

  const fullDescKey = Object.keys(row).find(k => k.toLowerCase().includes('full') && k.toLowerCase().includes('desc'));
  if (fullDescKey && row[fullDescKey] !== '') doc.fullDescription = row[fullDescKey].trim();

  const boxKey = Object.keys(row).find(k => k.toLowerCase().includes('box'));
  if (boxKey && row[boxKey] !== '') {
    doc.boxContents = row[boxKey].split(',').map(h => h.trim()).filter(Boolean);
  }

  let nlcValue = row.additionalcontent;
  if (!nlcValue) {
    const nlcKey = Object.keys(row).find(k => k.startsWith('nlc'));
    if (nlcKey) nlcValue = row[nlcKey];
  }
  if (nlcValue !== undefined && nlcValue !== '') {
    doc.additionalContent = convertToNLC(String(nlcValue));
  }

  // Child Category Logic - Only if category is Gas Stove & Chimney or Fan & Air Cooler
  if (row.childcategory && row.childcategory !== '') {
    if (row._resolvedCategory) {
      const slug = row._resolvedCategory.slug;
      if (slug === 'gas-stove' || slug === 'fan') {
        doc.childCategory = row.childcategory.trim();
      }
    }
  }

  // SubCategory Logic
  if (row.subcategory && row.subcategory !== '') {
    doc.subCategory = row.subcategory.trim();
  }

  return doc;
};

/**
 * Bulk-upserts validated sheet rows into the database.
 * Computes deep equality to avoid Mongoose timestamp updates on identical rows.
 */
export const upsertProducts = async (validRows, existingMap = new Map()) => {
  if (validRows.length === 0) return { inserted: 0, affected: 0 };

  const bulkOps = [];
  let affectedLocal = 0;

  for (const row of validRows) {
    const setDoc = buildSetDoc(row);
    let existingDoc = existingMap.get(row.modelnumber);

    let hasChanges = false;
    if (!existingDoc) {
      hasChanges = true;
    } else {
      // Stringify and parse to convert ObjectIds to strings and normalize Dates
      existingDoc = JSON.parse(JSON.stringify(existingDoc));
      
      for (const key of Object.keys(setDoc)) {
        if (!isEqualValue(setDoc[key], existingDoc[key])) {
          hasChanges = true;
          console.log("\n[DIFF DETECTED]", row.modelnumber);
          console.log("Field:", key);
          console.log("DB Value (old):", existingDoc[key], "Type:", typeof existingDoc[key]);
          console.log("Sheet Value (new):", setDoc[key], "Type:", typeof setDoc[key]);
          console.log("isEqualValue check failed!");
          break;
        }
      }
    }

    if (!hasChanges) {
      continue;
    }

    if (existingDoc) {
      affectedLocal++;
    }

    const setOnInsert = {};
    if (row.name) {
      setOnInsert.slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
      if (row.imageurl && row.imageurl !== '') {
        setOnInsert.images = [row.imageurl.trim()];
      }
    }

    bulkOps.push({
      updateOne: {
        filter: { modelNumber: row.modelnumber },
        update: {
          $set:         setDoc,
          $setOnInsert: setOnInsert,
        },
        upsert: !!row.name,
      },
    });
  }

  if (bulkOps.length === 0) {
    return { inserted: 0, affected: 0 };
  }

  try {
    const result = await Product.bulkWrite(bulkOps, { ordered: false });

    return {
      inserted: result.upsertedCount || 0,
      affected: affectedLocal,
    };
  } catch (error) {
    console.error('Bulk write error:', error);
    throw new Error('Database bulk write failed');
  }
};
