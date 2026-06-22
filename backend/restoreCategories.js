import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dns from 'dns';

// Fix for MongoDB Atlas ECONNREFUSED SRV errors
dns.setServers(['8.8.8.8', '8.8.4.4']);

import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Product from './models/Product.js';

dotenv.config();

const backupFile = process.argv[2];

async function run() {
  if (!backupFile) {
    console.error('Please provide the path to the backup JSON file. Example: node restoreCategories.js backup_12345.json');
    process.exit(1);
  }

  try {
    console.log(`Reading backup from ${backupFile}...`);
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    if (!data.categories || !data.brands || !data.products) {
      console.error('Invalid backup file format.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database.');

    console.log(`Restoring ${data.categories.length} Categories...`);
    await Category.deleteMany({});
    if (data.categories.length > 0) await Category.insertMany(data.categories);

    console.log(`Restoring ${data.brands.length} Brands...`);
    await Brand.deleteMany({});
    if (data.brands.length > 0) await Brand.insertMany(data.brands);

    console.log(`Restoring ${data.products.length} Products...`);
    await Product.deleteMany({});
    if (data.products.length > 0) {
      // Validate strict ObjectIds to prevent mixed references
      for (const p of data.products) {
        if (p.category && !mongoose.Types.ObjectId.isValid(p.category)) {
          throw new Error(`Migration Validation Failed: Product "${p.name}" has invalid Category reference "${p.category}". Must be ObjectId.`);
        }
        if (p.brand && !mongoose.Types.ObjectId.isValid(p.brand)) {
          throw new Error(`Migration Validation Failed: Product "${p.name}" has invalid Brand reference "${p.brand}". Must be ObjectId.`);
        }
      }
      await Product.insertMany(data.products);
    }

    console.log('\n[SUCCESS] Restoration Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Restoration failed:', err);
    process.exit(1);
  }
}

run();
