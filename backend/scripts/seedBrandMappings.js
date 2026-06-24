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

const SEED_MAPPINGS = [
  { brandSlug: 'samsung', mappings: [{ catSlug: 'tv' }, { catSlug: 'refrigerator' }, { catSlug: 'washing-machines' }, { catSlug: 'air-conditioners' }, { catSlug: 'oven' }] },
  { brandSlug: 'sony', mappings: [{ catSlug: 'tv' }, { catSlug: 'sound-system' }] },
  { brandSlug: 'bosch', mappings: [{ catSlug: 'dishwashers' }, { catSlug: 'washing-machines' }] },
  { brandSlug: 'haier', mappings: [{ catSlug: 'refrigerator' }, { catSlug: 'washing-machines' }, { catSlug: 'air-conditioners' }] },
  { brandSlug: 'natraj', mappings: [{ catSlug: 'ghar-ghanti' }] },
  { brandSlug: 'kent', mappings: [{ catSlug: 'water-purifier' }] },
  { brandSlug: 'prestige', mappings: [{ catSlug: 'mixer' }, { catSlug: 'gas-stove', childCategories: ['Gas Stove'] }] },
  { brandSlug: 'havells', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }, { catSlug: 'gyser' }, { catSlug: 'personal-care' }] },
  { brandSlug: 'zebronics', mappings: [{ catSlug: 'sound-system' }] },
  { brandSlug: 'tcl', mappings: [{ catSlug: 'tv' }, { catSlug: 'air-conditioners' }] },
  { brandSlug: 'ifb', mappings: [{ catSlug: 'washing-machines' }, { catSlug: 'dishwashers' }, { catSlug: 'oven' }] },
  { brandSlug: 'crompton', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }] },
  { brandSlug: 'orient', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }] },
  { brandSlug: 'symphony', mappings: [{ catSlug: 'fan', childCategories: ['Air Cooler'] }] },
  { brandSlug: 'wybor', mappings: [{ catSlug: 'fan', childCategories: ['Air Cooler'] }, { catSlug: 'tv' }] },
  { brandSlug: 'elicas', mappings: [{ catSlug: 'gas-stove', childCategories: ['Chimney'] }] },
  { brandSlug: 'sunshine', mappings: [{ catSlug: 'gas-stove', childCategories: ['Gas Stove'] }] },
  { brandSlug: 'sujata', mappings: [{ catSlug: 'gas-stove', childCategories: ['Gas Stove'] }, { catSlug: 'mixer' }] },
  { brandSlug: 'lg', mappings: [{ catSlug: 'tv' }, { catSlug: 'refrigerator' }, { catSlug: 'washing-machines' }, { catSlug: 'air-conditioners' }, { catSlug: 'oven' }] },
  { brandSlug: 'whirlpool', mappings: [{ catSlug: 'refrigerator' }, { catSlug: 'washing-machines' }] },
  { brandSlug: 'panasonic', mappings: [{ catSlug: 'tv' }, { catSlug: 'air-conditioners' }, { catSlug: 'oven' }, { catSlug: 'mixer' }] },
  { brandSlug: 'godrej', mappings: [{ catSlug: 'refrigerator' }, { catSlug: 'washing-machines' }, { catSlug: 'air-conditioners' }] },
  { brandSlug: 'bajaj', mappings: [{ catSlug: 'fan', childCategories: ['Fan', 'Air Cooler'] }, { catSlug: 'gyser' }, { catSlug: 'mixer' }] },
  { brandSlug: 'ushas', mappings: [{ catSlug: 'fan', childCategories: ['Fan', 'Air Cooler'] }, { catSlug: 'mixer' }] },
  { brandSlug: 'luminous', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }] },
  { brandSlug: 'atomberg', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }] },
  { brandSlug: 'voltas', mappings: [{ catSlug: 'air-conditioners' }, { catSlug: 'refrigerator' }] },
  { brandSlug: 'daikin', mappings: [{ catSlug: 'air-conditioners' }] },
  { brandSlug: 'hitachi', mappings: [{ catSlug: 'air-conditioners' }, { catSlug: 'refrigerator' }] },
  { brandSlug: 'blue-star', mappings: [{ catSlug: 'air-conditioners' }, { catSlug: 'water-purifier' }] },
  { brandSlug: 'eureka-forbes', mappings: [{ catSlug: 'water-purifier' }, { catSlug: 'vacuum-cleaner' }] },
  { brandSlug: 'aquaguard', mappings: [{ catSlug: 'water-purifier' }] },
  { brandSlug: 'dyson', mappings: [{ catSlug: 'vacuum-cleaner' }, { catSlug: 'personal-care' }] },
  { brandSlug: 'philips', mappings: [{ catSlug: 'personal-care' }, { catSlug: 'mixer' }, { catSlug: 'sound-system' }] },
  { brandSlug: 'jbl', mappings: [{ catSlug: 'sound-system' }] },
  { brandSlug: 'boat', mappings: [{ catSlug: 'sound-system' }, { catSlug: 'personal-care' }] },
  { brandSlug: 'hisense', mappings: [{ catSlug: 'tv' }] },
  { brandSlug: 'vu', mappings: [{ catSlug: 'tv' }] },
  { brandSlug: 'mi', mappings: [{ catSlug: 'tv' }, { catSlug: 'water-purifier' }, { catSlug: 'sound-system' }] },
  { brandSlug: 'oneplus', mappings: [{ catSlug: 'tv' }] },
  { brandSlug: 'epson', mappings: [{ catSlug: 'projector' }] },
  { brandSlug: 'benq', mappings: [{ catSlug: 'projector' }] },
  { brandSlug: 'singer', mappings: [{ catSlug: 'mixer' }] },
  { brandSlug: 'glen', mappings: [{ catSlug: 'gas-stove', childCategories: ['Gas Stove', 'Chimney'] }] },
  { brandSlug: 'faber', mappings: [{ catSlug: 'gas-stove', childCategories: ['Gas Stove', 'Chimney'] }] },
  { brandSlug: 'hindware', mappings: [{ catSlug: 'gas-stove', childCategories: ['Chimney'] }, { catSlug: 'gyser' }] },
  { brandSlug: 'pigeon', mappings: [{ catSlug: 'gas-stove', childCategories: ['Gas Stove'] }, { catSlug: 'mixer' }] },
  { brandSlug: 'butterfly', mappings: [{ catSlug: 'gas-stove', childCategories: ['Gas Stove'] }, { catSlug: 'mixer' }] },
  { brandSlug: 'milton', mappings: [{ catSlug: 'mixer' }] },
  { brandSlug: 'v-guard', mappings: [{ catSlug: 'gyser' }, { catSlug: 'fan', childCategories: ['Fan'] }] },
  { brandSlug: 'ao-smith', mappings: [{ catSlug: 'gyser' }, { catSlug: 'water-purifier' }] },
  { brandSlug: 'racold', mappings: [{ catSlug: 'gyser' }] },
  { brandSlug: 'morphy-richards', mappings: [{ catSlug: 'mixer' }, { catSlug: 'oven' }] },
  { brandSlug: 'agarwal', mappings: [{ catSlug: 'ghar-ghanti' }] },
  { brandSlug: 'navroop', mappings: [{ catSlug: 'ghar-ghanti' }] },
  { brandSlug: 'milcent', mappings: [{ catSlug: 'ghar-ghanti' }] },
  { brandSlug: 'panasonic', mappings: [{ catSlug: 'tv' }, { catSlug: 'air-conditioners' }, { catSlug: 'oven' }, { catSlug: 'mixer' }, { catSlug: 'personal-care' }] },
  { brandSlug: 'vega', mappings: [{ catSlug: 'personal-care' }] },
  { brandSlug: 'braun', mappings: [{ catSlug: 'personal-care' }] },
  { brandSlug: 'wobble', mappings: [{ catSlug: 'tv' }] },
  { brandSlug: 'toshiba', mappings: [{ catSlug: 'tv' }, { catSlug: 'refrigerator' }] },
  { brandSlug: 'mitsubishi-heavy-duty', mappings: [{ catSlug: 'air-conditioners' }] },
  { brandSlug: 'mitsubishi-electric', mappings: [{ catSlug: 'air-conditioners' }] },
  { brandSlug: 'onida', mappings: [{ catSlug: 'tv' }, { catSlug: 'air-conditioners' }, { catSlug: 'washing-machines' }] },
  { brandSlug: 'lloyd', mappings: [{ catSlug: 'tv' }, { catSlug: 'air-conditioners' }, { catSlug: 'refrigerator' }] },
  { brandSlug: 'fan-crompton', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }] },
  { brandSlug: 'fan-orient', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }] },
  { brandSlug: 'air-cooler-symphony', mappings: [{ catSlug: 'fan', childCategories: ['Air Cooler'] }] },
  { brandSlug: 'air-cooler-wybor', mappings: [{ catSlug: 'fan', childCategories: ['Air Cooler'] }] },
  { brandSlug: 'mycrofine', mappings: [{ catSlug: 'ghar-ghanti' }] },
  { brandSlug: 'h2o', mappings: [{ catSlug: 'water-purifier' }] },
  { brandSlug: 'usha', mappings: [{ catSlug: 'fan', childCategories: ['Fan'] }, { catSlug: 'mixer' }] },
  { brandSlug: 'agaro', mappings: [{ catSlug: 'mixer' }, { catSlug: 'personal-care' }, { catSlug: 'vacuum-cleaner' }] },
  { brandSlug: 'boss', mappings: [{ catSlug: 'mixer' }] },
  { brandSlug: 'maharaja', mappings: [{ catSlug: 'mixer' }] },
  { brandSlug: 'lee-star', mappings: [{ catSlug: 'mixer' }] },
  { brandSlug: 'wonderchef', mappings: [{ catSlug: 'mixer' }] },
  { brandSlug: 'lifelong', mappings: [{ catSlug: 'mixer' }, { catSlug: 'personal-care' }] },
  { brandSlug: 'benchmark', mappings: [{ catSlug: 'projector' }] },
  { brandSlug: 'viewsonic', mappings: [{ catSlug: 'projector' }] },
  { brandSlug: 'optoma', mappings: [{ catSlug: 'projector' }] },
  { brandSlug: 'acer', mappings: [{ catSlug: 'projector' }] },
  { brandSlug: 'karcher', mappings: [{ catSlug: 'vacuum-cleaner' }] },
  { brandSlug: 'inalsa', mappings: [{ catSlug: 'mixer' }, { catSlug: 'vacuum-cleaner' }] }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const isDryRun = process.argv.includes('--dry-run');

    console.log(isDryRun ? '--- DRY RUN STARTING ---' : '--- EXECUTION STARTING ---');

    const categories = await Category.find({});
    const categoryMap = {}; // slug -> ObjectId
    categories.forEach(c => categoryMap[c.slug] = c._id);

    const brands = await Brand.find({});
    let updatedCount = 0;
    
    for (const b of brands) {
      const seedData = SEED_MAPPINGS.find(s => s.brandSlug === b.slug);
      if (!seedData) {
        if (isDryRun) console.log(`[SKIP] Brand '${b.name}' has no mapping in seed list.`);
        continue;
      }

      const newMappings = [];
      for (const m of seedData.mappings) {
        const catId = categoryMap[m.catSlug];
        if (catId) {
          newMappings.push({
            category: catId,
            childCategories: m.childCategories || []
          });
        } else {
           console.log(`[WARNING] Category slug '${m.catSlug}' not found in DB for brand '${b.name}'.`);
        }
      }

      if (isDryRun) {
         console.log(`[UPDATE] Brand '${b.name}' will receive ${newMappings.length} mappings.`);
         newMappings.forEach(nm => {
            const cName = categories.find(c => c._id.toString() === nm.category.toString()).name;
            console.log(`   -> ${cName} ${nm.childCategories.length ? '(' + nm.childCategories.join(', ') + ')' : ''}`);
         });
      } else {
         b.mappedCategories = newMappings;
         await b.save();
      }
      updatedCount++;
    }

    console.log(isDryRun ? '\n--- DRY RUN COMPLETE ---' : '\n--- EXECUTION COMPLETE ---');
    console.log(`Brands ${isDryRun ? 'to be ' : ''}updated: ${updatedCount} out of ${brands.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
