import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Category from '../models/Category.js';
import Product from '../models/Product.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const runMigration = async () => {
  await connectDB();

  console.log('--- Starting Subcategory Migration ---');

  // 1. Upgrade Category Subcategories
  const categoriesToUpgrade = [
    { slug: 'fan-air-cooler', subs: ['Fan', 'Air Cooler'] },
    { slug: 'gas-stove-chimney', subs: ['Gas Stove', 'Chimney'] }
  ];

  for (const catInfo of categoriesToUpgrade) {
    const category = await Category.findOne({ slug: catInfo.slug });
    if (category) {
      console.log(`Checking category: ${category.name}`);
      
      const newSubs = catInfo.subs.map((subName, index) => {
        // Check if it already exists as an object
        const existing = category.subCategories.find(s => s.name === subName || s === subName);
        if (existing && typeof existing === 'object') {
          return existing; // Keep as is
        }
        return {
          name: subName,
          isActive: true,
          displayOrder: index + 1
        };
      });

      // Override with object schema
      category.subCategories = newSubs;
      await category.save();
      console.log(`Updated subcategories schema for ${category.name}`);
    }
  }

  // 2. Classify Products
  console.log('\n--- Classifying Products ---');
  const ambiguousProducts = [];
  let updatedCount = 0;

  for (const catInfo of categoriesToUpgrade) {
    const category = await Category.findOne({ slug: catInfo.slug });
    if (!category) continue;

    const products = await Product.find({ 
      category: category._id, 
      $or: [ { subCategory: { $exists: false } }, { subCategory: '' }, { subCategory: null } ]
    });

    console.log(`Found ${products.length} unclassified products in ${category.name}`);

    for (const product of products) {
      const searchString = `${product.name} ${product.tags?.join(' ')} ${product.shortDescription}`.toLowerCase();
      
      let matchedSub = null;
      let matchCount = 0;

      for (const sub of catInfo.subs) {
        // Simple heuristic: check if subcategory name appears in the search string
        const subLower = sub.toLowerCase();
        
        // Edge case: "Fan" might match inside other words, but usually it's fine for "fan", "air cooler", "chimney"
        // Let's use regex for exact word boundary
        const regex = new RegExp(`\\b${subLower}\\b`, 'i');
        
        if (regex.test(searchString) || searchString.includes(subLower)) {
          matchedSub = sub;
          matchCount++;
        }
      }

      if (matchCount === 1) {
        // 100% confidence
        product.subCategory = matchedSub;
        await product.save();
        updatedCount++;
      } else {
        // 0 or >1 matches = ambiguous
        ambiguousProducts.push({
          id: product._id,
          name: product.name,
          category: category.name,
          matches: matchCount
        });
      }
    }
  }

  console.log(`\nMigration Complete: Successfully assigned subcategory to ${updatedCount} products.`);
  
  if (ambiguousProducts.length > 0) {
    console.log('\n--- DRY-RUN REPORT: AMBIGUOUS PRODUCTS ---');
    console.log('The following products could not be classified with 100% confidence and were skipped. Please manually assign their subcategories in the Admin Panel:\n');
    ambiguousProducts.forEach(p => {
      console.log(`[${p.category}] ${p.name} (Matches: ${p.matches})`);
    });
  } else {
    console.log('\nNo ambiguous products found. All products successfully classified!');
  }

  process.exit();
};

runMigration();
