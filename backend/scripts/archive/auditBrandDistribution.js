import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import fs from 'fs';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // We will parse the seedBrandMappings file to get SEED_MAPPINGS
    const seedFile = fs.readFileSync(path.join(__dirname, 'seedBrandMappings.js'), 'utf-8');
    const match = seedFile.match(/const SEED_MAPPINGS = (\[[\s\S]*?\]);/);
    if (!match) throw new Error('Could not parse SEED_MAPPINGS');
    
    // Evaluate it safely
    const SEED_MAPPINGS = eval(match[1]);

    const categories = await Category.find({}).lean();
    const brands = await Brand.find({}).lean();

    const report = {
      unmappedBrands: [],
      categories: {}
    };

    categories.forEach(c => {
      report.categories[c.slug] = {
        name: c.name,
        isMixed: c.slug === 'gas-stove' || c.slug === 'fan',
        brands: new Set(),
        childCategories: {}
      };
    });

    let mappedBrandCount = 0;

    for (const b of brands) {
      const seedData = SEED_MAPPINGS.find(s => s.brandSlug === b.slug);
      if (!seedData || seedData.mappings.length === 0) {
        report.unmappedBrands.push(b.name);
      } else {
        mappedBrandCount++;
        seedData.mappings.forEach(m => {
           if (!report.categories[m.catSlug]) return; // Unknown category
           const cat = report.categories[m.catSlug];
           cat.brands.add(b.name);
           
           if (cat.isMixed && m.childCategories) {
              m.childCategories.forEach(child => {
                if (!cat.childCategories[child]) cat.childCategories[child] = new Set();
                cat.childCategories[child].add(b.name);
              });
           }
        });
      }
    }

    console.log('--- PRE-MIGRATION AUDIT REPORT ---\n');
    
    for (const catSlug in report.categories) {
      const cat = report.categories[catSlug];
      console.log(cat.name);
      if (!cat.isMixed) {
        console.log(`  Brands: ${cat.brands.size}`);
      } else {
        for (const child in cat.childCategories) {
          console.log(`  ${child} Brands: ${cat.childCategories[child].size}`);
        }
      }
      console.log('');
    }

    console.log('Unmapped Brands:');
    if (report.unmappedBrands.length === 0) {
      console.log('  None');
    } else {
      report.unmappedBrands.forEach(b => console.log(`  - ${b}`));
    }

    console.log(`\nTotal Brands Mapped: ${mappedBrandCount} out of ${brands.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
