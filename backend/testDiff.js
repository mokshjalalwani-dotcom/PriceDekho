import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { parseSheet } from './services/sync/sheetParser.service.js';
import { preloadCategories, preloadBrands } from './services/sync/categoryResolver.service.js';
import { validateRow } from './services/sync/validation.service.js';
import Product from './models/Product.js';
import { convertToNLC } from './utils/nlcConverter.js';
import { isDeepStrictEqual } from 'util';

const buildSetDoc = (row) => {
  const doc = {};
  if (row.name && row.name !== '') doc.name = row.name.trim();
  if (row.sellingprice || row.price) {
    const sp = Number(row.sellingprice || row.price);
    if (!isNaN(sp) && sp > 0) { doc.sellingPrice = sp; doc.price = sp; }
  }
  if (row.mrp && row.mrp !== '') {
    const mrp = Number(row.mrp);
    if (!isNaN(mrp)) doc.mrp = mrp;
  }
  if (doc.mrp > 0 && doc.sellingPrice > 0 && doc.mrp > doc.sellingPrice) {
    doc.discountPercentage = Math.round(((doc.mrp - doc.sellingPrice) / doc.mrp) * 100);
  }
  if (row._resolvedCategory) doc.category = row._resolvedCategory;
  if (row._resolvedBrand)    doc.brand    = row._resolvedBrand;
  if (row.stock !== undefined && row.stock !== '') {
    const countInStock = Number(row.stock);
    if (!isNaN(countInStock)) { doc.countInStock  = countInStock; doc.availability  = countInStock <= 0 ? 'Out of Stock' : 'In Stock'; }
  }
  if (row.imageurl && row.imageurl !== '') doc.mainImage = row.imageurl.trim();
  if (row.modelnumber && row.modelnumber !== '') doc.modelNumber = row.modelnumber.trim();
  const colorKey = Object.keys(row).find(k => k.toLowerCase().includes('color') || k.toLowerCase() === 'colour');
  if (colorKey && row[colorKey] !== '') doc.color = row[colorKey].trim();
  const highlightKey = Object.keys(row).find(k => k.toLowerCase().includes('highlight'));
  if (highlightKey && row[highlightKey] !== '') doc.highlights = row[highlightKey].split(',').map(h => h.trim()).filter(Boolean);
  const warrantyKey = Object.keys(row).find(k => k.toLowerCase().includes('warranty'));
  if (warrantyKey && row[warrantyKey] !== '') doc.warrantyDetails = row[warrantyKey].trim();
  const shortDescKey = Object.keys(row).find(k => k.toLowerCase().includes('short') && k.toLowerCase().includes('desc'));
  if (shortDescKey && row[shortDescKey] !== '') doc.shortDescription = row[shortDescKey].trim();
  const fullDescKey = Object.keys(row).find(k => k.toLowerCase().includes('full') && k.toLowerCase().includes('desc'));
  if (fullDescKey && row[fullDescKey] !== '') doc.fullDescription = row[fullDescKey].trim();
  const boxKey = Object.keys(row).find(k => k.toLowerCase().includes('box'));
  if (boxKey && row[boxKey] !== '') doc.boxContents = row[boxKey].split(',').map(h => h.trim()).filter(Boolean);
  if (row.subcategory   && row.subcategory   !== '') doc.subCategory   = row.subcategory.trim();
  if (row.childcategory && row.childcategory !== '') doc.childCategory = row.childcategory.trim();
  let nlcValue = row.additionalcontent;
  if (!nlcValue) { const nlcKey = Object.keys(row).find(k => k.startsWith('nlc')); if (nlcKey) nlcValue = row[nlcKey]; }
  if (nlcValue !== undefined && nlcValue !== '') doc.additionalContent = convertToNLC(String(nlcValue));
  const knownKeys = ['sku', 'name', 'sellingprice', 'price', 'mrp', 'category', 'brand', 'imageurl', 'stock', 'modelnumber', 'color', 'subcategory', 'childcategory', '_resolvedcategory', '_resolvedbrand', 'nlc', 'additionalcontent', 'highlights', 'keyhighlights', 'shortdescription'];
  const categoryFields = {};
  for (const key of Object.keys(row)) {
    const lk = key.toLowerCase();
    if (!knownKeys.includes(lk) && !lk.startsWith('nlc') && !lk.includes('highlight') && !lk.includes('color') && !lk.includes('warranty') && !(lk.includes('short') && lk.includes('desc')) && !(lk.includes('full')  && lk.includes('desc')) && !lk.includes('box') && row[key] !== '') {
      categoryFields[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
    }
  }
  if (Object.keys(categoryFields).length > 0) doc.categoryFields = categoryFields;
  return doc;
};

const isEqualValue = (newVal, oldVal) => {
  if (newVal === oldVal) return true;
  if (oldVal && oldVal._bsontype === 'ObjectID' && typeof newVal === 'string') return oldVal.toString() === newVal;
  if (newVal && newVal._bsontype === 'ObjectID' && typeof oldVal === 'string') return newVal.toString() === oldVal;
  if (oldVal && typeof oldVal === 'object' && oldVal.toString && typeof newVal === 'string' && oldVal.toString() === newVal) return true;
  if (newVal && typeof newVal === 'object' && newVal.toString && typeof oldVal === 'string' && newVal.toString() === oldVal) return true;
  if (newVal == null && oldVal == null) return true;
  if (newVal == null || oldVal == null) return false;
  if (typeof newVal !== 'object' || typeof oldVal !== 'object') return false;
  if (Array.isArray(newVal) && Array.isArray(oldVal)) {
    if (newVal.length !== oldVal.length) return false;
    for (let i = 0; i < newVal.length; i++) { if (!isEqualValue(newVal[i], oldVal[i])) return false; }
    return true;
  }
  if (Array.isArray(newVal) !== Array.isArray(oldVal)) return false;
  const newKeys = Object.keys(newVal);
  for (const k of newKeys) { if (!isEqualValue(newVal[k], oldVal[k])) return false; }
  return true;
};

async function testDiff() {
  await mongoose.connect(process.env.MONGO_URI);
  const rows = await parseSheet('https://docs.google.com/spreadsheets/d/1msmhEGxCD1cAhyuqHeiPkKEBV-QmGeprO4_T7lUKk20/edit?gid=0#gid=0');
  await preloadCategories();
  await preloadBrands();
  
  const dbProducts = await Product.find({}).lean();
  const existingMap = new Map(dbProducts.map(p => [p.modelNumber, p]));
  
  let affected = 0;
  for (let i=0; i < rows.length; i++) {
    validateRow(rows[i], i);
    const setDoc = buildSetDoc(rows[i]);
    const existingDoc = existingMap.get(rows[i].modelnumber);
    if (!existingDoc) continue;
    
    let hasChanges = false;
    for (const key of Object.keys(setDoc)) {
      if (!isEqualValue(setDoc[key], existingDoc[key])) {
        hasChanges = true;
        console.log(`[Diff] ${rows[i].modelnumber} - Field "${key}" changed:\n  Old:`, existingDoc[key], `\n  New:`, setDoc[key]);
      }
    }
    if (hasChanges) affected++;
  }
  console.log(`Total rows: ${rows.length}, affected updates: ${affected}`);
  process.exit(0);
}

testDiff().catch(err => { console.error(err); process.exit(1); });
