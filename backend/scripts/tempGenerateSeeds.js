import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const products = await Product.find({}).populate('category').populate('brand');
    const mappingObj = {};

    products.forEach(p => {
      if (!p.brand || !p.category) return;
      const bSlug = p.brand.slug;
      const cSlug = p.category.slug;
      const child = p.childCategory;
      
      if (!mappingObj[bSlug]) mappingObj[bSlug] = {};
      if (!mappingObj[bSlug][cSlug]) mappingObj[bSlug][cSlug] = new Set();
      
      if (child) mappingObj[bSlug][cSlug].add(child);
    });

    const output = [];
    for (const bSlug in mappingObj) {
      const cats = [];
      for (const cSlug in mappingObj[bSlug]) {
        const childArr = Array.from(mappingObj[bSlug][cSlug]);
        cats.push({
          categorySlug: cSlug,
          childCategories: childArr
        });
      }
      output.push({
        brandSlug: bSlug,
        categories: cats
      });
    }

    console.log(JSON.stringify(output, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
