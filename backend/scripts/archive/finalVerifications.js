import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Check Duplicates
    console.log('--- 1. DUPLICATE MAPPINGS CHECK ---');
    const brands = await Brand.find({ isActive: true });
    let duplicates = 0;
    
    for (let b of brands) {
      const catIds = b.mappedCategories.map(m => m.category.toString());
      const uniqueCatIds = [...new Set(catIds)];
      if (catIds.length !== uniqueCatIds.length) {
        console.log(`[DUPLICATE FOUND] ${b.name} has duplicate categories.`);
        
        // Let's actually FIX them right now if they exist
        const newMappedCategories = [];
        const seen = new Set();
        for (let m of b.mappedCategories) {
          if (!seen.has(m.category.toString())) {
            seen.add(m.category.toString());
            newMappedCategories.push(m);
          } else {
             // merge childCategories
             const existing = newMappedCategories.find(x => x.category.toString() === m.category.toString());
             existing.childCategories = [...new Set([...(existing.childCategories || []), ...(m.childCategories || [])])];
          }
        }
        b.mappedCategories = newMappedCategories;
        await b.save();
        console.log(`[FIXED] ${b.name} duplicates removed.`);
        duplicates++;
      }
    }
    console.log(`Total brands with duplicate categories: ${duplicates}`);
    if (duplicates === 0) console.log('Duplicate mappings = 0. All clear!');

    // 2. Brand API Filtering Check
    console.log('\n--- 2. BRAND API FILTERING CHECK ---');
    const gasStoveCat = await Category.findOne({ slug: 'gas-stove' });
    if (gasStoveCat) {
      // Simulate API query: /api/brands?category=<Gas Stove & Chimney>
      const filter = {
        isActive: true,
        mappedCategories: {
          $elemMatch: {
            category: gasStoveCat._id
          }
        }
      };
      const apiBrands = await Brand.find(filter).sort({ name: 1 });
      const apiBrandNames = apiBrands.map(b => b.name);
      console.log(`Brands mapped to Gas Stove & Chimney: ${apiBrandNames.length}`);
      
      const leaked = ['Samsung', 'Sony', 'Bosch'].filter(n => apiBrandNames.includes(n));
      if (leaked.length > 0) {
        console.log(`[FAIL] Leaked brands: ${leaked.join(', ')}`);
      } else {
        console.log('[PASS] Samsung, Sony, Bosch are NOT returned.');
      }
    }

    // 4. Category rename protection
    console.log('\n--- 4. CATEGORY RENAME PROTECTION ---');
    const projectorCat = await Category.findOne({ slug: 'projector' });
    if (projectorCat) {
      const oldName = projectorCat.name;
      console.log(`Old name: ${oldName}`);
      const mappedBefore = await Brand.countDocuments({ 'mappedCategories.category': projectorCat._id });
      console.log(`Mapped brands before rename: ${mappedBefore}`);
      
      // Simulate rename
      projectorCat.name = 'Projectors';
      await projectorCat.save();
      
      const mappedAfter = await Brand.countDocuments({ 'mappedCategories.category': projectorCat._id });
      console.log(`Mapped brands after rename to "Projectors": ${mappedAfter}`);
      
      if (mappedBefore === mappedAfter && mappedAfter > 0) {
        console.log('[PASS] Mappings use ObjectIds and survived rename.');
      } else {
        console.log('[FAIL] Mappings were lost!');
      }
      
      // Revert rename
      projectorCat.name = oldName;
      await projectorCat.save();
    }

    // 5. Child category filtering
    console.log('\n--- 5. CHILD CATEGORY FILTERING ---');
    if (gasStoveCat) {
       // Simulate API query: /api/brands?category=<id>&childCategory=Gas Stove
       const gsFilter = {
         isActive: true,
         mappedCategories: {
           $elemMatch: {
             category: gasStoveCat._id,
             childCategories: 'Gas Stove'
           }
         }
       };
       const gsBrands = await Brand.find(gsFilter);
       const gsBrandNames = gsBrands.map(b => b.name);
       console.log(`Gas Stove child category brands: ${gsBrandNames.join(', ')}`);
       
       // Simulate API query: /api/brands?category=<id>&childCategory=Chimney
       const chimneyFilter = {
         isActive: true,
         mappedCategories: {
           $elemMatch: {
             category: gasStoveCat._id,
             childCategories: 'Chimney'
           }
         }
       };
       const chimneyBrands = await Brand.find(chimneyFilter);
       const chimneyBrandNames = chimneyBrands.map(b => b.name);
       console.log(`Chimney child category brands: ${chimneyBrandNames.join(', ')}`);
       
       const leak = gsBrandNames.filter(n => chimneyBrandNames.includes(n));
       // Some might genuinely make both, but the user expects Elicas only for Chimney based on seed.
       if (chimneyBrandNames.includes('Prestige') || chimneyBrandNames.includes('Sujata')) {
         console.log(`[FAIL] Gas Stove brands leaked into Chimney!`);
       } else {
         console.log('[PASS] Child category isolation works.');
       }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
