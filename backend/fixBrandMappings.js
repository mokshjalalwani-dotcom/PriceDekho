import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './models/Brand.js';
import Category from './models/Category.js';
import dns from 'dns';

// Fix for MongoDB Atlas ECONNREFUSED SRV errors on some Windows environments
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const isDryRun = process.argv.includes('--dry-run');

const exactMappingBySlug = {
  "tv": ["Samsung", "Sony", "VU", "TCL", "Hisense", "Wobble"],
  "projector": ["Zebronics"],
  "sound-system": ["Zebronics", "Samsung", "Sony", "JBL"],
  "refrigerator": ["Samsung", "Haier"],
  "washing-machines": ["Samsung", "Haier", "IFB"],
  "dishwashers": ["IFB", "Bosch", "Toshiba"],
  "air-conditioners": ["Daikin", "Mitsubishi Heavy Duty", "Mitsubishi Electric", "Onida", "Samsung", "Haier", "Panasonic", "Hisense", "Wybor", "Hitachi", "Voltas", "Lloyd"],
  "fan": ["Fan - Crompton", "Fan - Orient", "Air Cooler - Symphony", "Air Cooler - Wybor"],
  "vacuum-cleaner": ["Eureka Forbes"],
  "ghar-ghanti": ["Mycrofine"],
  "oven": ["Samsung", "Haier", "IFB"],
  "water-purifier": ["Aquaguard", "H2O"],
  "mixer": ["Philips", "Sujata", "Usha", "Agaro", "Boss", "Haier", "Maharaja", "Lee Star", "Wonderchef", "Lifelong", "Morphy Richards"],
  "gas-stove": ["Elicas", "Sunshine", "Sujata"],
  "gyser": ["Bajaj", "Haier", "Havells", "Benchmark"],
  "personal-care": ["Philips"]
};

const brandAliases = {
  "eureka fobes": "Eureka Forbes",
  "aquagaurd": "Aquaguard",
  "fan-crompton": "Fan - Crompton",
  "fan-orient": "Fan - Orient",
  "air cooler-symphony": "Air Cooler - Symphony",
  "air cooler-wybor": "Air Cooler - Wybor"
};

async function fixBrandMappings() {
  console.log(`Starting Brand Mapping Fix ${isDryRun ? '(DRY RUN)' : ''}...`);

  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://developer:1234@cluster0.mongodb.net/pricedekho?retryWrites=true&w=majority');
  console.log('MongoDB Connected.\n');

  try {
    const categories = await Category.find({});
    const categorySlugToId = {};
    categories.forEach(c => { categorySlugToId[c.slug] = c._id; });

    // 1. Build the inverted mapping: Brand Name -> Set of Category IDs
    const targetBrandMap = new Map(); // name -> Set(category IDs)
    for (const [slug, brandNames] of Object.entries(exactMappingBySlug)) {
      const catId = categorySlugToId[slug];
      if (!catId) {
        console.warn(`WARNING: Category slug '${slug}' not found in DB!`);
        continue;
      }
      for (const bName of brandNames) {
        const canonicalName = bName.trim();
        if (!targetBrandMap.has(canonicalName)) {
          targetBrandMap.set(canonicalName, new Set());
        }
        targetBrandMap.get(canonicalName).add(catId.toString());
      }
    }

    // 2. Fetch existing brands and process them
    const existingBrands = await Brand.find({});
    const processedBrandIds = new Set();
    const existingBrandNamesLower = new Map();
    existingBrands.forEach(b => existingBrandNamesLower.set(b.name.toLowerCase(), b));

    // For every brand we WANT to exist
    for (const [targetName, targetCategories] of targetBrandMap.entries()) {
      const targetLower = targetName.toLowerCase();
      
      // Find matching existing brand (check exact match lower, or alias)
      let matchedBrand = existingBrandNamesLower.get(targetLower);
      
      // Check alias
      if (!matchedBrand) {
        for (const [aliasLower, canonicalName] of Object.entries(brandAliases)) {
          if (canonicalName.toLowerCase() === targetLower) {
            matchedBrand = existingBrandNamesLower.get(aliasLower);
            if (matchedBrand) break;
          }
        }
      }

      if (matchedBrand) {
        processedBrandIds.add(matchedBrand._id.toString());
        
        let needsUpdate = false;
        
        // Check if name needs case/typo correction
        if (matchedBrand.name !== targetName) {
          console.log(`[RENAME] '${matchedBrand.name}' -> '${targetName}'`);
          matchedBrand.name = targetName;
          matchedBrand.slug = targetName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          needsUpdate = true;
        }

        // Check if categories match exactly
        const currentCatIds = matchedBrand.categories.map(id => id.toString());
        const targetCatArray = Array.from(targetCategories);
        
        const sortedCurrent = [...currentCatIds].sort();
        const sortedTarget = [...targetCatArray].sort();

        if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedTarget)) {
          const currentCatNames = currentCatIds.map(id => categories.find(c => c._id.toString() === id)?.name || id);
          const targetCatNames = targetCatArray.map(id => categories.find(c => c._id.toString() === id)?.name || id);
          console.log(`[UPDATE MAPPING] '${targetName}' categories:`);
          console.log(`  From: ${currentCatNames.join(', ')}`);
          console.log(`  To:   ${targetCatNames.join(', ')}`);
          
          matchedBrand.categories = targetCatArray;
          needsUpdate = true;
        }

        if (needsUpdate && !isDryRun) {
          await matchedBrand.save();
        }
      } else {
        // Brand doesn't exist, create it
        const targetCatArray = Array.from(targetCategories);
        const targetCatNames = targetCatArray.map(id => categories.find(c => c._id.toString() === id)?.name || id);
        console.log(`[CREATE] Brand '${targetName}' with categories: ${targetCatNames.join(', ')}`);
        
        if (!isDryRun) {
          const newBrand = new Brand({
            name: targetName,
            slug: targetName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            categories: targetCatArray,
            isActive: true
          });
          await newBrand.save();
        }
      }
    }

    // 3. Handle leftover brands not in the exact mapping (e.g. Natraj, Kent)
    for (const b of existingBrands) {
      if (!processedBrandIds.has(b._id.toString())) {
        if (b.categories && b.categories.length > 0) {
          const currentCatNames = b.categories.map(id => categories.find(c => c._id.toString() === id.toString())?.name || id);
          console.log(`[UNMAP] Extra Brand '${b.name}' - Clearing categories (was: ${currentCatNames.join(', ')})`);
          
          if (!isDryRun) {
            b.categories = [];
            await b.save();
          }
        }
      }
    }

    console.log(`\nMigration completed ${isDryRun ? '(DRY RUN)' : 'successfully'}.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixBrandMappings();
