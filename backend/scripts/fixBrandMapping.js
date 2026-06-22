import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const targetMappings = {
  "tv": ["Samsung", "Sony", "VU", "TCL", "Hisense", "Wobble"],
  "projector": ["Zebronics"],
  "sound-system": ["Zebronics", "Samsung", "Sony", "JBL"],
  "refrigerator": ["Samsung", "Haier"],
  "washing-machines": ["Samsung", "Haier", "IFB"],
  "dishwashers": ["IFB", "Bosch", "Toshiba"],
  "air-conditioners": ["Daikin", "Mitsubishi Heavy Duty", "Mitsubishi Electric", "Onida", "Samsung", "Haier", "Panasonic", "Hisense", "Wybor", "Hitachi", "Voltas", "Lloyd"],
  "fan": ["Crompton", "Orient", "Symphony", "Wybor"],
  "vacuum-cleaner": ["Eureka Forbes"],
  "ghar-ghanti": ["Mycrofine"],
  "oven": ["Samsung", "Haier", "IFB"],
  "water-purifier": ["Aquaguard", "H2O"],
  "mixer": ["Philips", "Sujata", "Usha", "Agaro", "Boss", "Haier", "Maharaja", "Lee Star", "Wonderchef", "Lifelong", "Morphy Richards"],
  "gas-stove": ["Elicas", "Sunshine", "Sujata"],
  "geyser": ["Bajaj", "Haier", "Havells", "Benchmark"],
  "personal-care": ["Philips"]
};

const runAuditAndFix = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    const categories = await Category.find({});
    const brands = await Brand.find({}).populate('categories', 'name slug');

    console.log("=========================================");
    console.log("=== STEP 1: INITIAL AUDIT REPORT ========");
    console.log("=========================================");
    
    let anomaliesCount = 0;
    
    brands.forEach(brand => {
      // Check for duplicates
      const uniqueCats = new Set(brand.categories.map(c => c._id?.toString()));
      if (uniqueCats.size !== brand.categories.length) {
        console.warn(`[ANOMALY] Brand '${brand.name}' has duplicate category entries!`);
        anomaliesCount++;
      }
      
      // Check Samsung specifically
      if (brand.name.toLowerCase() === 'samsung') {
        console.log(`\n[SAMSUNG FOCUS] Currently mapped to: ${brand.categories.length > 0 ? brand.categories.map(c => c.name).join(', ') : 'NONE'}`);
        if (brand.categories.length === 0) {
          console.warn(`[ANOMALY] Samsung is missing ALL electronics mappings!`);
          anomaliesCount++;
        }
      }
    });

    console.log(`\nFound ${anomaliesCount} pre-existing anomalies.`);

    console.log("\n=========================================");
    console.log("=== STEP 2: FIXING MAPPINGS ==============");
    console.log("=========================================");

    let addedCount = 0;
    let unchangedCount = 0;

    // We will dynamically map Samsung to any category that looks like an electronic/appliance
    const electronicsKeywords = ['tv', 'television', 'audio', 'sound', 'refrigerator', 'washing', 'ac', 'air', 'oven', 'smart', 'electronic', 'appliance', 'mobile', 'phone'];
    const dynamicSamsungCategories = categories.filter(c => 
      electronicsKeywords.some(kw => c.name.toLowerCase().includes(kw) || c.slug.toLowerCase().includes(kw))
    );

    // Apply strict target mappings
    for (const [slug, brandNames] of Object.entries(targetMappings)) {
      const category = categories.find(c => c.slug === slug);
      if (!category) {
        console.log(`[SKIP] Category slug '${slug}' not found in DB.`);
        continue;
      }

      for (const brandName of brandNames) {
        let brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });
        
        if (!brand) {
          console.log(`[CREATE] Brand '${brandName}' not found. Creating safely...`);
          brand = new Brand({
            name: brandName,
            slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            categories: []
          });
          await brand.save(); // Save to generate ID
        }

        if (!brand.categories.includes(category._id)) {
          brand.categories.push(category._id);
          await brand.save(); // pre-save hook will deduplicate
          console.log(`[ADDED] Mapped '${brand.name}' -> '${category.name}'`);
          addedCount++;
        } else {
          unchangedCount++;
        }
      }
    }

    // Apply dynamic Samsung mappings
    console.log("\n--- Applying Dynamic Samsung Electronics Mappings ---");
    let samsungBrand = await Brand.findOne({ name: { $regex: /^samsung$/i } });
    if (samsungBrand) {
      for (const cat of dynamicSamsungCategories) {
        if (!samsungBrand.categories.includes(cat._id)) {
          samsungBrand.categories.push(cat._id);
          await samsungBrand.save();
          console.log(`[ADDED] Mapped 'Samsung' -> '${cat.name}' (Dynamic Electronics Rule)`);
          addedCount++;
        } else {
          unchangedCount++;
        }
      }
    }

    console.log("\n=========================================");
    console.log("=== STEP 3: FINAL AUDIT REPORT ==========");
    console.log("=========================================");
    
    const updatedBrands = await Brand.find({}).populate('categories', 'name slug');
    const finalSamsung = updatedBrands.find(b => b.name.toLowerCase() === 'samsung');

    console.log(`[SAMSUNG FINAL STATE] Mapped to ${finalSamsung?.categories.length} categories:`);
    if (finalSamsung && finalSamsung.categories.length > 0) {
      console.log(`  -> ${finalSamsung.categories.map(c => c.name).join(', ')}`);
    }

    console.log(`\n[SUMMARY]`);
    console.log(`Total New Mappings Added: ${addedCount}`);
    console.log(`Total Existing Mappings Kept: ${unchangedCount}`);
    console.log(`Status: SUCCESS (Idempotent run completed)`);
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
};

runAuditAndFix();
