import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const brands = await Brand.find({}).lean();
    const products = await Product.find({}).lean();

    const legacyPrefixes = ['Fan - ', 'Air Cooler - ', 'fan-', 'air-cooler-'];
    const merges = [];

    console.log('--- BRAND NORMALIZATION & CONFLICT REPORT ---\n');

    for (const b of brands) {
      let isLegacy = false;
      let rootName = b.name;

      for (const prefix of legacyPrefixes) {
        if (b.name.toLowerCase().startsWith(prefix.toLowerCase())) {
          isLegacy = true;
          rootName = b.name.substring(prefix.length).trim();
          break;
        }
      }

      if (isLegacy) {
        // Find root brand
        const rootBrand = brands.find(rb => rb.name.toLowerCase() === rootName.toLowerCase());
        const productsUsingLegacy = products.filter(p => p.brand && p.brand.toString() === b._id.toString());
        
        if (rootBrand) {
          merges.push({
            legacy: b.name,
            legacyId: b._id,
            root: rootBrand.name,
            rootId: rootBrand._id,
            affectedProducts: productsUsingLegacy.length,
            status: 'Ready to Merge'
          });
        } else {
          merges.push({
            legacy: b.name,
            legacyId: b._id,
            root: rootName,
            rootId: null,
            affectedProducts: productsUsingLegacy.length,
            status: 'Root Brand Missing (Will Rename Instead of Merge)'
          });
        }
      }
    }

    if (merges.length === 0) {
      console.log('No legacy duplicate brands detected.');
    } else {
      merges.forEach(m => {
        console.log(`Legacy Brand: ${m.legacy}`);
        console.log(`Target Root Brand: ${m.root}`);
        console.log(`Affected Products: ${m.affectedProducts}`);
        console.log(`Action: ${m.status}`);
        console.log('-------------------------------\n');
      });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
