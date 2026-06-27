import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection;
  
  const cats = await db.collection('categories').find({}).toArray();
  console.log('--- Categories ---');
  cats.forEach(c => console.log(c.name, c.slug));
  
  const kitchenCat = cats.find(c => c.name.toLowerCase().includes('kitchen') || c.slug.includes('kitchen'));
  if (kitchenCat) {
    console.log('\n--- Kitchen Subcategories ---');
    const subs = await db.collection('subcategories').find({ category: kitchenCat._id }).toArray();
    subs.forEach(s => console.log(s.name, s.slug, s.childCategory));
  } else {
    console.log('\nNo Kitchen Appliance category found.');
  }
  
  await mongoose.connection.close();
}

run().catch(console.error);
