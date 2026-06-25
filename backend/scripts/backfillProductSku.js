import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Product from '../models/Product.js';

// Fix for MongoDB Atlas ECONNREFUSED SRV errors on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runBackfill() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const products = await Product.find({ sku: { $exists: false } });
    console.log(`Found ${products.length} products without an SKU.`);

    let updatedCount = 0;
    for (const product of products) {
      // Deterministic SKU based on _id as requested by the user
      const newSku = `PRD-${product._id.toString().toUpperCase()}`;
      
      product.sku = newSku;
      await product.save({ validateBeforeSave: false }); // Skip validation in case of legacy invalid data
      updatedCount++;

      if (updatedCount % 50 === 0) {
        console.log(`Processed ${updatedCount}/${products.length} products...`);
      }
    }

    // Also handle products where sku is null or empty string
    const nullSkuProducts = await Product.find({ sku: { $in: [null, ''] } });
    console.log(`Found ${nullSkuProducts.length} products with null/empty SKU.`);
    
    for (const product of nullSkuProducts) {
      const newSku = `PRD-${product._id.toString().toUpperCase()}`;
      product.sku = newSku;
      await product.save({ validateBeforeSave: false });
      updatedCount++;
    }

    console.log(`Successfully backfilled SKUs for ${updatedCount} products total.`);
  } catch (error) {
    console.error('Error backfilling SKUs:', error);
  } finally {
    process.exit(0);
  }
}

runBackfill();
