import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Category from '../models/Category.js';

const verifyDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('--- DATABASE VERIFICATION ---');
    
    const gasStoveCat = await Category.findOne({ slug: 'gas-stove' }).select('name slug subCategories');
    console.log('Gas Stove & Chimney Category:');
    console.log(JSON.stringify(gasStoveCat, null, 2));

    const fanCat = await Category.findOne({ slug: 'fan' }).select('name slug subCategories');
    console.log('\nFan & Air Cooler Category:');
    console.log(JSON.stringify(fanCat, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyDatabase();
