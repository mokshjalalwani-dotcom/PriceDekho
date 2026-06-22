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

// Map user's category names to actual system slugs
const categorySlugMap = {
  "Television": "tv",
  "Projector": "projector",
  "Audio": "sound-system",
  "Refrigerator": "refrigerator",
  "Washing Machine": "washing-machines",
  "Dish Washer": "dishwashers",
  "Air Conditioner": "air-conditioners",
  "Fan & Air Cooler": "fan",
  "Vacuum Cleaner": "vacuum-cleaner",
  "Ghar Ghanti (Aata Maker)": "ghar-ghanti",
  "Oven": "oven",
  "Water Purifier": "water-purifier",
  "Kitchen Appliance": "mixer", // Or whatever the real slug is
  "Gas Stove & Chimney": "gas-stove",
  "Geyser": "geyser",
  "Personal Care": "personal-care"
};

const fixMapping = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Clear existing mappings
    await Brand.updateMany({}, { $set: { categories: [] } });
    console.log("Cleared old mappings.");

    for (const [slug, brandNames] of Object.entries(targetMappings)) {
      const category = await Category.findOne({ slug });
      if (!category) {
        console.warn(`Category slug '${slug}' not found in DB! Skipping...`);
        continue;
      }

      for (const brandName of brandNames) {
        // Try finding exactly or case-insensitive
        let brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });
        
        if (!brand) {
          console.warn(`Brand '${brandName}' not found in DB. Creating it...`);
          brand = new Brand({
            name: brandName,
            slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            categories: []
          });
        }

        // Push if not exists
        if (!brand.categories.includes(category._id)) {
          brand.categories.push(category._id);
          await brand.save();
        }
      }
      console.log(`Updated mapping for Category: ${category.name} (${brandNames.length} brands)`);
    }

    console.log("\nFinished mapping completely.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixMapping();
