import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const runAudit = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- PRODUCT INTEGRITY AUDIT ---');

    const products = await Product.find().populate('category brand');
    const categories = await Category.find();
    const brands = await Brand.find();

    console.log(`Total Products to Audit: ${products.length}\n`);

    const issues = {
      invalidCategory: [],
      invalidBrand: [],
      unmappedBrand: [],
      missingChildCategory: [],
      emptySpecs: [],
      missingImages: [],
      duplicateNames: [],
      duplicateSlugs: [],
      duplicateSKUs: []
    };

    const nameMap = {};
    const slugMap = {};
    const skuMap = {};

    products.forEach(p => {
      // 1. Invalid Category
      if (!p.category) {
        issues.invalidCategory.push(p.name);
      }

      // 2. Invalid Brand
      if (!p.brand) {
        issues.invalidBrand.push(p.name);
      }

      // 3. Brand not mapped to category
      if (p.category && p.brand) {
        const catId = p.category._id.toString();
        const b = brands.find(br => br._id.toString() === p.brand._id.toString());
        if (b) {
          const mapping = b.mappedCategories.find(m => m.category.toString() === catId);
          if (!mapping) {
            issues.unmappedBrand.push(p.name);
          }
        }
      }

      // 4. Mixed-category products missing childCategory
      if (p.category) {
        const isMixed = ['gas-stove', 'fan'].includes(p.category.slug);
        if (isMixed && !p.childCategory) {
          issues.missingChildCategory.push(p.name);
        }
      }

      // 5. Missing or empty specifications
      if (!p.specGroups || p.specGroups.length === 0 || p.specGroups.every(g => g.fields.length === 0)) {
        issues.emptySpecs.push(p.name);
      }

      // 6. Missing images
      if (!p.mainImage && (!p.images || p.images.length === 0)) {
        issues.missingImages.push(p.name);
      }

      // 7. Duplicate Names
      if (nameMap[p.name]) issues.duplicateNames.push(p.name);
      else nameMap[p.name] = true;

      // 8. Duplicate Slugs
      if (slugMap[p.slug]) issues.duplicateSlugs.push(p.slug);
      else slugMap[p.slug] = true;

      // 9. Duplicate SKUs (Model Number)
      if (p.modelNumber) {
        if (skuMap[p.modelNumber]) issues.duplicateSKUs.push(p.modelNumber);
        else skuMap[p.modelNumber] = true;
      }
    });

    console.log(`1. Products with invalid category references: ${issues.invalidCategory.length}`);
    if (issues.invalidCategory.length > 0) console.log(issues.invalidCategory.join(', '));

    console.log(`2. Products with invalid brand references: ${issues.invalidBrand.length}`);
    if (issues.invalidBrand.length > 0) console.log(issues.invalidBrand.join(', '));

    console.log(`3. Products whose brand is not mapped to their category: ${issues.unmappedBrand.length}`);
    if (issues.unmappedBrand.length > 0) console.log(issues.unmappedBrand.join(', '));

    console.log(`4. Mixed-category products missing childCategory: ${issues.missingChildCategory.length}`);
    if (issues.missingChildCategory.length > 0) console.log(issues.missingChildCategory.join(', '));

    console.log(`5. Products with missing or empty specifications: ${issues.emptySpecs.length}`);
    if (issues.emptySpecs.length > 0) console.log(issues.emptySpecs.join(', '));

    console.log(`6. Products with missing images: ${issues.missingImages.length}`);
    if (issues.missingImages.length > 0) console.log(issues.missingImages.join(', '));

    console.log(`7. Duplicate product names: ${issues.duplicateNames.length}`);
    if (issues.duplicateNames.length > 0) console.log(issues.duplicateNames.join(', '));

    console.log(`8. Duplicate slugs: ${issues.duplicateSlugs.length}`);
    if (issues.duplicateSlugs.length > 0) console.log(issues.duplicateSlugs.join(', '));

    console.log(`9. Duplicate SKUs (model numbers): ${issues.duplicateSKUs.length}`);
    if (issues.duplicateSKUs.length > 0) console.log(issues.duplicateSKUs.join(', '));

    // 10. Orphaned images would require scanning S3/local storage vs DB
    console.log(`10. Orphaned image files not linked to products: Require filesystem/S3 cross-check.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runAudit();
