import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Product from '../models/Product.js';

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const childCategoriesList = [
  'Induction',
  'Mixer Grinder',
  'Juicer',
  'Juicer Mixer Grinder',
  'Food Processor',
  'Hand Blender',
  'Chopper',
  'Wet Grinder',
  'Electric Kettle',
  'Toaster',
  'Sandwich Maker',
  'Air Fryer',
  'Rice Cooker',
  'Coffee Maker',
  'Nutri Blender',
  'Infrared Cooktop',
  'Room Heater',
  'Iron',
  'Garment Steamer',
  'Stand Mixer'
];

function generateSlug(name) {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    // 1. Target Parent Category
    let kitchenCat = await Category.findOne({ name: 'Kitchen Appliance' });
    
    if (!kitchenCat) {
      console.log('Creating "Kitchen Appliance" category...');
      const maxDisplayOrderCat = await Category.findOne().sort('-displayOrder');
      const nextDisplayOrder = maxDisplayOrderCat ? maxDisplayOrderCat.displayOrder + 1 : 1;
      
      kitchenCat = await Category.create({
        name: 'Kitchen Appliance',
        slug: 'kitchen-appliance',
        displayOrder: nextDisplayOrder,
        isActive: true,
      });
      console.log(`Created parent category: ${kitchenCat.name} (ID: ${kitchenCat._id})`);
    } else {
      console.log(`Found existing parent category: ${kitchenCat.name} (ID: ${kitchenCat._id})`);
    }

    let createdCount = 0;
    let skippedCount = 0;
    const insertedDetails = [];

    // 2 & 3. Iterate and Create Subcategories
    let currentMaxOrderSub = await Subcategory.findOne({ category: kitchenCat._id }).sort('-displayOrder');
    let orderCounter = currentMaxOrderSub ? currentMaxOrderSub.displayOrder + 1 : 1;

    for (const name of childCategoriesList) {
      const slug = generateSlug(name);
      
      // 4. Duplicate Handling
      const existing = await Subcategory.findOne({ category: kitchenCat._id, slug });
      
      if (existing) {
        skippedCount++;
        console.log(`[SKIP] ${name} already exists.`);
      } else {
        const newSub = await Subcategory.create({
          name: name,
          slug: slug,
          category: kitchenCat._id,
          childCategory: name, // As requested
          isActive: true,
          displayOrder: orderCounter++
        });
        
        createdCount++;
        insertedDetails.push({ name: newSub.name, slug: newSub.slug });
        console.log(`[CREATE] Added ${name} -> ${slug}`);
      }
    }

    // 10. Final Verification Output
    console.log('\n=======================================');
    console.log('FINAL VERIFICATION OUTPUT');
    console.log('=======================================');
    console.log(`A. Summary`);
    console.log(`- Total categories processed: ${childCategoriesList.length}`);
    console.log(`- Successfully created: ${createdCount}`);
    console.log(`- Skipped (already existed): ${skippedCount}`);
    
    console.log(`\nB. Database Validation (Inserted list)`);
    insertedDetails.forEach(d => console.log(`- ${d.name} (${d.slug})`));

    // C. Integrity Check
    const finalSubs = await Subcategory.find({ category: kitchenCat._id });
    const slugs = finalSubs.map(s => s.slug);
    const uniqueSlugs = new Set(slugs);
    const hasDuplicates = slugs.length !== uniqueSlugs.size;
    
    console.log(`\nC. Integrity Check`);
    console.log(`- No duplicate slugs under Kitchen Appliance: ${!hasDuplicates ? 'CONFIRMED' : 'FAILED'}`);
    console.log(`- No product data modified: CONFIRMED (Script only accesses Category and Subcategory models)`);

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await mongoose.connection.close();
  }
}

run();
