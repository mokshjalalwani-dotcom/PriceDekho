import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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
    console.log('Connected to DB for Backup...');

    const brands = await Brand.find({}).lean();
    const products = await Product.find({}).lean();

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const brandsFile = path.join(backupDir, `brands_backup_${timestamp}.json`);
    const productsFile = path.join(backupDir, `products_backup_${timestamp}.json`);

    fs.writeFileSync(brandsFile, JSON.stringify(brands, null, 2));
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    console.log(`✓ Backup complete.`);
    console.log(`  - Brands saved to: ${brandsFile} (${brands.length} records)`);
    console.log(`  - Products saved to: ${productsFile} (${products.length} records)`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
