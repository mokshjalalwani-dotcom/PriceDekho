import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import Brand from '../models/Brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const brandsToAdd = [
  'Philips', 'Sujata', 'Bajaj', 'Preethi', 'Havells', 'Crompton', 'Borosil',
  'Kent', 'AGARO', 'Prestige', 'Hawkins', 'Pigeon', 'Sunflame', 'Butterfly',
  'Wonderchef', 'Elica', 'Hindware', 'Kaff', 'Usha', 'Inalsa', 'Morphy Richards',
  'Glen', 'Maharaja Whiteline', 'Kenstar', 'Lifelong'
];

function generateSlug(name) {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    let createdCount = 0;
    let skippedCount = 0;

    for (const name of brandsToAdd) {
      // Case-insensitive check
      const existing = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      
      if (existing) {
        console.log(`[SKIP] Brand "${existing.name}" already exists.`);
        skippedCount++;
      } else {
        const slug = generateSlug(name);
        await Brand.create({
          name: name,
          slug: slug,
          isActive: true
        });
        console.log(`[CREATE] Added brand "${name}" (slug: ${slug})`);
        createdCount++;
      }
    }

    console.log('\n=======================================');
    console.log('FINAL RESULT');
    console.log('=======================================');
    console.log(`Total brands evaluated: ${brandsToAdd.length}`);
    console.log(`Successfully added: ${createdCount}`);
    console.log(`Skipped (already in DB): ${skippedCount}`);

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await mongoose.connection.close();
  }
}

run();
