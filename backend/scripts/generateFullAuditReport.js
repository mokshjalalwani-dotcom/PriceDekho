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
    
    const seedFile = fs.readFileSync(path.join(__dirname, 'seedBrandMappings.js'), 'utf-8');
    const match = seedFile.match(/const SEED_MAPPINGS = (\[[\s\S]*?\]);/);
    const SEED_MAPPINGS = eval(match[1]);

    const categories = await Category.find({}).lean();
    const brands = await Brand.find({}).lean();
    const products = await Product.find({}).populate('category').populate('brand').lean();

    console.log('# Full Category → Child Category → Brand → Product Audit\n');

    categories.forEach(cat => {
      console.log(`## ${cat.name}`);
      const isMixed = cat.slug === 'gas-stove' || cat.slug === 'fan';
      
      // Get brands mapped to this category via SEED
      const mappedBrandsForCat = SEED_MAPPINGS.filter(s => 
        s.mappings.some(m => m.catSlug === cat.slug)
      ).map(s => {
        const brandRecord = brands.find(b => b.slug === s.brandSlug);
        const mappingInfo = s.mappings.find(m => m.catSlug === cat.slug);
        return { brand: brandRecord, childCats: mappingInfo.childCategories || [] };
      }).filter(b => b.brand);

      if (!isMixed) {
        if (mappedBrandsForCat.length === 0) {
          console.log(`  *(No brands mapped)*\n`);
          return;
        }
        
        mappedBrandsForCat.forEach(mb => {
           console.log(`  ### Brand: ${mb.brand.name}`);
           const prods = products.filter(p => p.category && p.category._id.toString() === cat._id.toString() && p.brand && p.brand._id.toString() === mb.brand._id.toString());
           if (prods.length === 0) {
             console.log(`    - 0 Products`);
           } else {
             prods.forEach(p => console.log(`    - Product: ${p.name}`));
           }
        });
        console.log('');
      } else {
        // Collect all possible child categories based on mappings or products
        const childCats = new Set();
        mappedBrandsForCat.forEach(mb => mb.childCats.forEach(c => childCats.add(c)));
        
        if (childCats.size === 0) {
           console.log(`  *(No child categories mapped)*\n`);
           return;
        }

        Array.from(childCats).forEach(child => {
           console.log(`  ### Child Category: ${child}`);
           const brandsForChild = mappedBrandsForCat.filter(mb => mb.childCats.includes(child));
           
           brandsForChild.forEach(mb => {
              console.log(`    #### Brand: ${mb.brand.name}`);
              const prods = products.filter(p => p.category && p.category._id.toString() === cat._id.toString() && p.childCategory === child && p.brand && p.brand._id.toString() === mb.brand._id.toString());
              if (prods.length === 0) {
                 console.log(`      - 0 Products`);
              } else {
                 prods.forEach(p => console.log(`      - Product: ${p.name}`));
              }
           });
        });
        console.log('');
      }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
