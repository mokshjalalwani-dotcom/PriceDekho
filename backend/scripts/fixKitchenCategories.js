import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for MongoDB Atlas ECONNREFUSED SRV errors
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load models
import Category from '../models/Category.js';

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

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const kitchenCat = await Category.findOne({ name: 'Kitchen Appliance' });
    if (!kitchenCat) {
      console.log('Kitchen Appliance category not found.');
      process.exit(1);
    }

    const db = mongoose.connection.db;
    
    // Fetch the raw document to bypass Mongoose schema
    const rawCat = await db.collection('categories').findOne({ _id: kitchenCat._id });
    
    let currentSubs = rawCat.subCategories || [];
    
    // Add the new ones if not present
    for (const name of childCategoriesList) {
      if (!currentSubs.includes(name)) {
        currentSubs.push(name);
      }
    }
    
    // Ensure 'Mixer' is also there if it was before (from the screenshot)
    if (!currentSubs.includes('Mixer')) {
      currentSubs.unshift('Mixer');
    }
    
    // Update the document directly in MongoDB to bypass Mongoose schema strictness
    await db.collection('categories').updateOne(
      { _id: kitchenCat._id },
      { $set: { subCategories: currentSubs } }
    );
    
    console.log('Successfully updated Category.subCategories array with the new child categories!');
    console.log('Current SubCategories array:', currentSubs);

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await mongoose.connection.close();
  }
}

run();
