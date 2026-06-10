import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

// All 12 categories with display order
const SEED_CATEGORIES = [
  { name: 'Televisions', slug: 'tv', icon: 'Tv', displayOrder: 1 },
  { name: 'Refrigerator', slug: 'refrigerator', icon: 'Refrigerator', displayOrder: 2 },
  { name: 'Fan', slug: 'fan', icon: 'Fan', displayOrder: 3 },
  { name: 'Mixer', slug: 'mixer', icon: 'Blend', displayOrder: 4 },
  { name: 'Water Purifier', slug: 'water-purifier', icon: 'Droplets', displayOrder: 5 },
  { name: 'Ghar Ghanti', slug: 'ghar-ghanti', icon: 'Settings2', displayOrder: 6 },
  { name: 'Sound System', slug: 'sound-system', icon: 'Speaker', displayOrder: 7 },
  { name: 'Air Conditioner', slug: 'air-conditioners', icon: 'AirVent', displayOrder: 8 },
  { name: 'Washing Machine', slug: 'washing-machines', icon: 'WashingMachine', displayOrder: 9 },
  { name: 'Oven', slug: 'oven', icon: 'Microwave', displayOrder: 10 },
  { name: 'Gas Stove', slug: 'gas-stove', icon: 'Flame', displayOrder: 11 },
  { name: 'Dishwasher', slug: 'dishwashers', icon: 'Box', displayOrder: 12 },
];

const importData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await User.deleteMany();

    // Create an Admin User
    const createdUsers = await User.create([
      {
        name: 'Admin User',
        email: 'admin@satguru.com',
        password: 'password123',
        isAdmin: true,
      }
    ]);

    const adminUser = createdUsers[0]._id;

    // Create all 12 categories
    const createdCategories = {};
    for (const cat of SEED_CATEGORIES) {
      const c = await Category.create(cat);
      createdCategories[cat.name] = c._id;
      // Also map by slug for flexible matching
      createdCategories[cat.slug] = c._id;
    }

    // Read sample data (two levels up from utils/ → project root)
    const sampleDataPath = path.join(__dirname, '../../sample_data.json');
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

    // Extract unique brand names and create
    const brandNames = [...new Set(sampleData.map(p => p.brandName))];
    const createdBrands = {};
    for (const name of brandNames) {
      const slug = name.toLowerCase().replace(/[\s&]+/g, '-');
      const b = await Brand.create({ name, slug });
      createdBrands[name] = b._id;
    }

    // Map sample products to DB schemas
    const products = sampleData.map(p => {
      const { brandName, categoryName, categorySlug, ...productData } = p;

      // Find category ID by name or slug
      const categoryId = createdCategories[categoryName] || createdCategories[categorySlug];

      // Sync price fields
      const sellingPrice = productData.sellingPrice || productData.price || 0;
      const price = sellingPrice;
      const mainImage = productData.images?.[0] || '';

      return {
        ...productData,
        brand: createdBrands[brandName],
        category: categoryId,
        price,
        sellingPrice,
        mainImage,
        galleryImages: productData.images?.slice(1) || [],
        // Ensure nested objects are properly set
        specifications: productData.specifications || {},
        categoryFields: productData.categoryFields || {},
        specGroups: productData.specGroups || [],
        highlights: productData.highlights || [],
        boxContents: productData.boxContents || [],
        tags: productData.tags || [],
        variants: productData.variants || [],
        isVisible: true,
      };
    });

    await Product.insertMany(products);

    console.log('✅ Data Imported Successfully!');
    console.log(`   Categories: ${SEED_CATEGORIES.length}`);
    console.log(`   Brands: ${brandNames.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Admin: admin@satguru.com / password123`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
