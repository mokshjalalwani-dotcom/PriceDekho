import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { convertToNLC } from '../utils/nlcConverter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

const migrateNLC = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.\n');

    if (DRY_RUN) {
      console.log('*** RUNNING IN DRY-RUN MODE (No changes will be saved) ***\n');
    } else {
      console.log('*** RUNNING IN LIVE MODE (Changes WILL be saved) ***\n');
    }

    // Find all products that have additionalContent
    const allProducts = await Product.find({ additionalContent: { $exists: true, $ne: '' } });
    
    let totalScanned = allProducts.length;
    let needsUpdateCount = 0;
    let updatedCount = 0;

    console.log(`Total products with NLC field: ${totalScanned}`);

    for (const product of allProducts) {
      const originalNLC = product.additionalContent;
      
      // If it contains any digit, it likely needs conversion
      if (/\d/.test(originalNLC)) {
        needsUpdateCount++;
        const convertedNLC = convertToNLC(originalNLC);
        
        console.log(`[Product: ${product.slug}]`);
        console.log(`  Original : ${originalNLC}`);
        console.log(`  Converted: ${convertedNLC}`);
        
        if (!DRY_RUN) {
          product.additionalContent = convertedNLC;
          await product.save({ validateBeforeSave: false }); // Skip validation just in case other fields fail
          updatedCount++;
        }
      }
    }

    console.log('\n=======================================');
    console.log('MIGRATION REPORT');
    console.log('=======================================');
    console.log(`Total products scanned        : ${totalScanned}`);
    console.log(`Products with numeric NLC     : ${needsUpdateCount}`);
    console.log(`Products actually updated     : ${updatedCount}`);
    if (DRY_RUN) {
      console.log('Status: DRY-RUN Complete. To run for real, remove the --dry-run flag.');
    } else {
      console.log('Status: LIVE RUN Complete. Database updated safely.');
    }
    console.log('=======================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateNLC();
