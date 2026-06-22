import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const targetMappings = [
  { match: ['tv', 'television'], brands: ["Samsung", "Sony", "VU", "TCL", "Hisense", "Wobble"] },
  { match: ['projector'], brands: ["Zebronics"] },
  { match: ['audio', 'sound'], brands: ["Zebronics", "Samsung", "Sony", "JBL"] },
  { match: ['refrigerator', 'fridge'], brands: ["Samsung", "Haier"] },
  { match: ['washing'], brands: ["Samsung", "Haier", "IFB"] },
  { match: ['dish'], brands: ["IFB", "Bosch", "Toshiba"] },
  { match: ['air condition', 'ac'], brands: ["Daikin", "Mitsubishi Heavy Duty", "Mitsubishi Electric", "Onida", "Samsung", "Haier", "Panasonic", "Hisense", "Wybor", "Hitachi", "Voltas", "Lloyd"] },
  { match: ['fan', 'cooler'], brands: ["Crompton", "Orient", "Symphony", "Wybor"] },
  { match: ['vacuum'], brands: ["Eureka Forbes"] },
  { match: ['ghar ghanti', 'aata'], brands: ["Mycrofine"] },
  { match: ['oven', 'microwave'], brands: ["Samsung", "Haier", "IFB"] },
  { match: ['water pur', 'ro'], brands: ["Aquaguard", "H2O"] },
  { match: ['kitchen', 'mixer'], brands: ["Philips", "Sujata", "Usha", "Agaro", "Boss", "Haier", "Maharaja", "Lee Star", "Wonderchef", "Lifelong", "Morphy Richards"] },
  { match: ['gas', 'chimney'], brands: ["Elicas", "Sunshine", "Sujata"] },
  { match: ['geyser'], brands: ["Bajaj", "Haier", "Havells", "Benchmark"] },
  { match: ['personal care', 'trimmer'], brands: ["Philips"] }
];

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

    // Apply strict target mappings with flexible keyword matching
    for (const mapping of targetMappings) {
      // Find all matching categories
      const matchedCategories = categories.filter(c => 
        mapping.match.some(kw => c.name.toLowerCase().includes(kw) || c.slug.toLowerCase().includes(kw))
      );

      if (matchedCategories.length === 0) {
        console.log(`[SKIP] No categories found matching keywords: ${mapping.match.join(', ')}`);
        continue;
      }

      for (const category of matchedCategories) {
        for (const brandName of mapping.brands) {
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
            await brand.save(); // pre-save hook will deduplicate & filter orphans
            console.log(`[ADDED] Mapped '${brand.name}' -> '${category.name}'`);
            addedCount++;
          } else {
            unchangedCount++;
          }
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
