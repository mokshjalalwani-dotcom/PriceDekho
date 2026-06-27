import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const allBrands = await Brand.find({ isActive: true }).populate('mappedCategories.category');
    const allProducts = await Product.find({ isActive: true }).populate('category brand');
    const allCategories = await Category.find({ isActive: true });
    
    console.log(`Total Brands: ${allBrands.length}`);
    console.log(`Total Products: ${allProducts.length}`);
    
    // Check for orphaned products
    const orphanedProducts = allProducts.filter(p => !p.brand);
    console.log(`Orphaned Products: ${orphanedProducts.length}`);
    
    // Total products per category
    const catCounts = {};
    allProducts.forEach(p => {
      const c = p.category?.name || 'Unknown';
      catCounts[c] = (catCounts[c] || 0) + 1;
    });
    console.log('\nProducts by Category:');
    Object.entries(catCounts).forEach(([c, count]) => console.log(`- ${c}: ${count}`));

    console.log('\nBrands mapped per Category:');
    allCategories.forEach(cat => {
      const mapped = allBrands.filter(b => b.mappedCategories.some(m => m.category?._id.toString() === cat._id.toString()));
      console.log(`- ${cat.name}: ${mapped.length}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
