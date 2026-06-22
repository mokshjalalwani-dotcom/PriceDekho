import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const targetMappings = {
  "Television": ["Samsung", "Sony", "VU", "TCL", "Hisense", "Wobble"],
  "Projector": ["Zebronics"],
  "Audio": ["Zebronics", "Samsung", "Sony", "JBL"],
  "Refrigerator": ["Samsung", "Haier"],
  "Washing Machine": ["Samsung", "Haier", "IFB"],
  "Dish Washer": ["IFB", "Bosch", "Toshiba"],
  "Air Conditioner": ["Daikin", "Mitsubishi Heavy Duty", "Mitsubishi Electric", "Onida", "Samsung", "Haier", "Panasonic", "Hisense", "Wybor", "Hitachi", "Voltas", "Lloyd"],
  "Fan & Air Cooler": ["Crompton", "Orient", "Symphony", "Wybor"],
  "Vacuum Cleaner": ["Eureka Forbes"],
  "Ghar Ghanti (Aata Maker)": ["Mycrofine"],
  "Oven": ["Samsung", "Haier", "IFB"],
  "Water Purifier": ["Aquaguard", "H2O"],
  "Kitchen Appliance": ["Philips", "Sujata", "Usha", "Agaro", "Boss", "Haier", "Maharaja", "Lee Star", "Wonderchef", "Lifelong", "Morphy Richards"],
  "Gas Stove & Chimney": ["Elicas", "Sunshine", "Sujata"],
  "Geyser": ["Bajaj", "Haier", "Havells", "Benchmark"],
  "Personal Care": ["Philips"]
};

const runAuditAndFix = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    const categories = await Category.find({});
    
    // Cleanup any completely incorrect massive mappings due to previous greedy regex
    await Brand.updateMany({}, { $set: { categories: [] } });

    console.log("=========================================");
    console.log("=== APPLYING EXACT MAPPINGS =============");
    console.log("=========================================");

    let addedCount = 0;

    for (const [catName, brandNames] of Object.entries(targetMappings)) {
      // Find category by exact name
      const category = categories.find(c => c.name.toLowerCase() === catName.toLowerCase() || c.slug.toLowerCase() === catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      
      if (!category) {
        console.log(`[SKIP] Category '${catName}' not found in DB.`);
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
          await brand.save(); // pre-save hook will deduplicate & filter orphans
          console.log(`[ADDED] Mapped '${brand.name}' -> '${category.name}'`);
          addedCount++;
        }
      }
    }

    // Apply dynamic Samsung electronics mapping fallback just in case
    console.log("\n--- Applying Dynamic Samsung Electronics Mappings ---");
    const electronicsKeywords = ['television', 'audio', 'refrigerator', 'washing machine', 'air conditioner', 'oven', 'mobile', 'phone'];
    const dynamicSamsungCategories = categories.filter(c => 
      electronicsKeywords.some(kw => c.name.toLowerCase() === kw)
    );

    let samsungBrand = await Brand.findOne({ name: { $regex: /^samsung$/i } });
    if (samsungBrand) {
      for (const cat of dynamicSamsungCategories) {
        if (!samsungBrand.categories.includes(cat._id)) {
          samsungBrand.categories.push(cat._id);
          await samsungBrand.save();
          console.log(`[ADDED] Mapped 'Samsung' -> '${cat.name}' (Dynamic Electronics Rule)`);
          addedCount++;
        }
      }
    }

    console.log(`\nStatus: SUCCESS (${addedCount} total mappings restored correctly)`);
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
};

runAuditAndFix();
