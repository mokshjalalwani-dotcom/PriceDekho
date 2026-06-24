import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const totalProducts = await Product.countDocuments();
    
    const gasStoveCat = await Category.findOne({ slug: 'gas-stove' }).lean();
    const fanCat = await Category.findOne({ slug: 'fan' }).lean();

    const gasStoveProducts = await Product.find({ category: gasStoveCat._id }).lean();
    const fanProducts = await Product.find({ category: fanCat._id }).lean();

    const mixedProducts = [...gasStoveProducts, ...fanProducts];

    const missingChildCategory = mixedProducts.filter(p => !p.childCategory);
    const missingSubCategory = mixedProducts.filter(p => !p.subCategory);

    // Products that would be modified: Those in mixed categories that have a subCategory but NO childCategory
    const toModify = mixedProducts.filter(p => p.subCategory && !p.childCategory);

    console.log('\n=======================================');
    console.log('       MIGRATION VERIFICATION REPORT    ');
    console.log('=======================================\n');
    console.log(`1. Total products in database: ${totalProducts}`);
    console.log(`2. Products belonging to Gas Stove & Chimney: ${gasStoveProducts.length}`);
    console.log(`3. Products belonging to Fan & Air Cooler: ${fanProducts.length}`);
    console.log(`4. Mixed products with missing childCategory: ${missingChildCategory.length}`);
    console.log(`5. Mixed products with missing subCategory: ${missingSubCategory.length}`);
    console.log(`6. Products that would be modified by migration: ${toModify.length}`);
    
    if (toModify.length > 0) {
      console.log('\nDetails of products to be modified:');
      toModify.forEach(p => {
        console.log(` - ${p.name} (Current subCategory: '${p.subCategory}') -> Will become childCategory`);
      });
    }

    console.log('\n=======================================');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
