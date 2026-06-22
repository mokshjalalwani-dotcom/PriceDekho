import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const audit = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const categories = await Category.find({}).sort({ name: 1 });
    const brands = await Brand.find({}).populate('categories', 'name slug').sort({ name: 1 });

    console.log(`\n============================`);
    console.log(`DB Total Categories: ${categories.length}`);
    console.log(`DB Total Brands: ${brands.length}`);
    console.log(`============================\n`);

    console.log(`--- Category -> Linked Brands ---`);
    for (const cat of categories) {
      const linkedBrands = brands.filter(b => b.categories.some(c => c._id.toString() === cat._id.toString()));
      console.log(`${cat.name}:`);
      if (linkedBrands.length > 0) {
        linkedBrands.forEach(b => console.log(`  - ${b.name}`));
      } else {
        console.log(`  (No brands linked)`);
      }
    }

    console.log(`\n--- Brand -> Linked Categories ---`);
    for (const brand of brands) {
      console.log(`${brand.name}:`);
      if (brand.categories.length > 0) {
        brand.categories.forEach(c => console.log(`  - ${c.name}`));
      } else {
        console.log(`  (No categories linked)`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  }
};

audit();
