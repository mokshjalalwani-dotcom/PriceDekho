import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

const seedData = async () => {
  try {
    const directUri = process.env.MONGO_URI.replace(
      'mongodb+srv://Admin:u88bBmFtUJ9HWkJz@pricedekho.akrjdfp.mongodb.net/',
      'mongodb://Admin:u88bBmFtUJ9HWkJz@ac-06e8c1u-shard-00-00.akrjdfp.mongodb.net:27017,ac-06e8c1u-shard-00-01.akrjdfp.mongodb.net:27017,ac-06e8c1u-shard-00-02.akrjdfp.mongodb.net:27017/?ssl=true&replicaSet=atlas-i1y0tz-shard-0&authSource=admin&retryWrites=true&w=majority'
    );
    // Alternatively, just use the first node if replicaSet name is unknown:
    const fallbackUri = 'mongodb://Admin:u88bBmFtUJ9HWkJz@ac-06e8c1u-shard-00-00.akrjdfp.mongodb.net:27017,ac-06e8c1u-shard-00-01.akrjdfp.mongodb.net:27017,ac-06e8c1u-shard-00-02.akrjdfp.mongodb.net:27017/test?tls=true&authSource=admin';
    await mongoose.connect(fallbackUri);
    console.log('Connected to MongoDB');

    const beforeCategories = await Category.countDocuments();
    const beforeBrands = await Brand.countDocuments();
    console.log(`\nBefore changes: ${beforeCategories} Categories, ${beforeBrands} Brands`);

    const newCategories = [
      { name: 'Projector', slug: 'projector', iconKey: 'projector', isActive: true },
      { name: 'Vacuum Cleaner', slug: 'vacuum-cleaner', iconKey: 'vacuum-cleaner', isActive: true },
      { name: 'Geyser', slug: 'gyser', iconKey: 'geyser', isActive: true },
    ];

    let maxOrderCat = await Category.findOne().sort('-displayOrder');
    let currentOrder = maxOrderCat ? maxOrderCat.displayOrder + 1 : 1;

    for (const cat of newCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create({ ...cat, displayOrder: currentOrder++ });
        console.log(`Created Category: ${cat.name}`);
      } else {
        await Category.updateOne({ slug: cat.slug }, { $set: { iconKey: cat.iconKey, name: cat.name, isActive: cat.isActive } });
        console.log(`Updated Category: ${cat.name}`);
      }
    }

    const newBrandsList = [
      'Zebronics', 'Epson', 'BenQ', 'ViewSonic', 'Optoma', 'Acer',
      'Eureka Forbes', 'Philips', 'Karcher', 'Agaro', 'Kent', 'Inalsa',
      'Bajaj', 'Haier', 'Havells', 'Benchmark', 'Racold', 'AO Smith', 'V-Guard', 'Crompton'
    ];

    let addedBrands = [];

    for (const brandName of newBrandsList) {
      // Case insensitive check
      const exists = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });
      if (!exists) {
        const slug = brandName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        // Ensure slug is unique
        let finalSlug = slug;
        let slugExists = await Brand.findOne({ slug: finalSlug });
        let counter = 1;
        while (slugExists) {
          finalSlug = `${slug}-${counter}`;
          slugExists = await Brand.findOne({ slug: finalSlug });
          counter++;
        }

        await Brand.create({ name: brandName, slug: finalSlug, isActive: true });
        addedBrands.push(brandName);
      }
    }

    console.log(`\nNewly created brands: ${addedBrands.length > 0 ? addedBrands.join(', ') : 'None (all existed)'}`);

    const afterCategories = await Category.countDocuments();
    const afterBrands = await Brand.countDocuments();
    
    console.log(`\nAfter changes: ${afterCategories} Categories, ${afterBrands} Brands`);

    // Verification check for total 16
    console.log(`Total categories remain 16? ${afterCategories === 16 ? 'Yes' : 'No (' + afterCategories + ')'}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedData();
