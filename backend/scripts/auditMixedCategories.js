import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../models/Product.js';
import Category from '../models/Category.js';

const auditMixedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.\n');

    console.log('--- AUDITING MIXED CATEGORIES (Gas Stove & Chimney, Fan & Air Cooler) ---\n');

    // Find the relevant categories
    const gasStoveCat = await Category.findOne({ slug: 'gas-stove' });
    const fanCat = await Category.findOne({ slug: 'fan' });

    if (!gasStoveCat && !fanCat) {
      console.log('Target categories not found in database.');
      process.exit(0);
    }

    const targetCategoryIds = [gasStoveCat?._id, fanCat?._id].filter(Boolean);

    // Find all products in these categories that are missing a subCategory
    const ambiguousProducts = await Product.find({
      category: { $in: targetCategoryIds },
      $or: [
        { subCategory: { $exists: false } },
        { subCategory: '' },
        { subCategory: null }
      ]
    }).populate('category', 'name slug');

    if (ambiguousProducts.length === 0) {
      console.log('✅ ALL CLEAR! No ambiguous products found in mixed categories.');
      process.exit(0);
    }

    console.log(`⚠️ FOUND ${ambiguousProducts.length} PRODUCTS REQUIRING MANUAL CORRECTION ⚠️`);
    console.log('These products are in combined categories but do not have a Child Category assigned.\n');

    let gasStoveCount = 0;
    let fanCount = 0;

    ambiguousProducts.forEach((product, index) => {
      const isGasStove = product.category.slug === 'gas-stove';
      if (isGasStove) gasStoveCount++;
      else fanCount++;

      console.log(`${index + 1}. [${product.category.name}]`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Product ID: ${product._id}`);
      console.log(`   Admin Edit Link: /admin/products?edit=${product._id}`);
      console.log('   --------------------------------------------------');
    });

    console.log(`\n--- SUMMARY ---`);
    console.log(`Gas Stove & Chimney: ${gasStoveCount} missing subcategory`);
    console.log(`Fan & Air Cooler: ${fanCount} missing subcategory`);
    console.log(`\nACTION REQUIRED: Please log in to the Admin Panel, edit these products, and assign the correct Child Category.`);
    console.log(`Note: These products remain visible on the storefront, but will not show category-specific features until corrected.\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error during audit:', error);
    process.exit(1);
  }
};

auditMixedCategories();
