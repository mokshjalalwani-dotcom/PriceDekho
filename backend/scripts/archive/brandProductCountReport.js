import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import fs from 'fs';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Parse SEED_MAPPINGS
    const seedFile = fs.readFileSync(path.join(__dirname, 'seedBrandMappings.js'), 'utf-8');
    const match = seedFile.match(/const SEED_MAPPINGS = (\[[\s\S]*?\]);/);
    if (!match) throw new Error('Could not parse SEED_MAPPINGS');
    
    const SEED_MAPPINGS = eval(match[1]);

    const categories = await Category.find({}).lean();
    const brands = await Brand.find({}).lean();
    const products = await Product.find({}).lean();

    const categoryMap = {}; // slug -> name
    categories.forEach(c => categoryMap[c.slug] = c.name);

    console.log('--- FINAL BRAND MAPPING & PRODUCT COUNT REPORT ---\n');

    for (const b of brands) {
      const seedData = SEED_MAPPINGS.find(s => s.brandSlug === b.slug);
      
      console.log(b.name);
      if (!seedData || seedData.mappings.length === 0) {
         console.log('Categories:\n  None');
      } else {
         console.log('Categories:');
         seedData.mappings.forEach(m => {
            const catName = categoryMap[m.catSlug] || m.catSlug;
            let display = `- ${catName}`;
            if (m.childCategories && m.childCategories.length > 0) {
               display += ` (${m.childCategories.join(', ')})`;
            }
            console.log(display);
         });
      }

      const count = products.filter(p => p.brand && p.brand.toString() === b._id.toString()).length;
      console.log(`\nProducts Using Brand:\n${count}\n`);
      console.log('---------------------------\n');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
