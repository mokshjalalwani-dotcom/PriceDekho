import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for Migration...');

    const gasStoveCat = await Category.findOne({ slug: 'gas-stove' }).lean();
    const fanCat = await Category.findOne({ slug: 'fan' }).lean();

    const gasStoveProducts = await Product.find({ category: gasStoveCat._id }).lean();
    const fanProducts = await Product.find({ category: fanCat._id }).lean();

    const mixedProducts = [...gasStoveProducts, ...fanProducts];

    // Products that need migration: mixed category, have a subCategory, but NO childCategory
    const toModify = mixedProducts.filter(p => p.subCategory && !p.childCategory);

    console.log(`Found ${toModify.length} products to migrate.`);

    for (const p of toModify) {
      console.log(`Migrating: ${p.name}`);
      await Product.updateOne(
        { _id: p._id },
        { 
          $set: { 
            childCategory: p.subCategory, 
            subCategory: '' 
          } 
        }
      );
      console.log(` -> Moved '${p.subCategory}' to childCategory. subCategory is now empty.`);
    }

    console.log('\nMigration Complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
