import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for MongoDB Atlas ECONNREFUSED SRV errors
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load models
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';

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

    // Delete subcategories that match the 20 names under Kitchen Appliance
    const result = await Subcategory.deleteMany({
      category: kitchenCat._id,
      name: { $in: childCategoriesList }
    });

    console.log(`Successfully removed ${result.deletedCount} duplicate subcategories from the Subcategory collection.`);
    
    // Check if there are any remaining subcategories for Kitchen Appliance
    const remaining = await Subcategory.find({ category: kitchenCat._id });
    if (remaining.length > 0) {
      console.log('Remaining Subcategories under Kitchen Appliance:');
      remaining.forEach(r => console.log(`- ${r.name}`));
    } else {
      console.log('No other subcategories remain under Kitchen Appliance in the Subcategory collection.');
    }

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await mongoose.connection.close();
  }
}

run();
