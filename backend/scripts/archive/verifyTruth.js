import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../models/Product.js';
import Category from '../models/Category.js';

const fetchApi = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

const verifyTruth = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.\n');

    const gasStoveCat = await Category.findOne({ name: 'Gas Stove & Chimney' });
    const fanCat = await Category.findOne({ name: 'Fan & Air Cooler' });

    console.log(`Gas Stove & Chimney ID: ${gasStoveCat._id}, Slug: ${gasStoveCat.slug}`);
    console.log(`Fan & Air Cooler ID: ${fanCat._id}, Slug: ${fanCat.slug}`);

    const gasProducts = await Product.find({ category: gasStoveCat._id }).populate('category brand');
    const fanProducts = await Product.find({ category: fanCat._id }).populate('category brand');

    console.log('\n--- EXACT DATABASE RECORDS (Gas Stove & Chimney) ---');
    gasProducts.forEach(p => {
      console.log(JSON.stringify({
        name: p.name,
        category: p.category.name,
        childCategory: p.childCategory,
        subCategory: p.subCategory,
        brand: p.brand ? p.brand.name : 'null'
      }, null, 2));
    });

    console.log('\n--- EXACT DATABASE RECORDS (Fan & Air Cooler) ---');
    fanProducts.forEach(p => {
      console.log(JSON.stringify({
        name: p.name,
        category: p.category.name,
        childCategory: p.childCategory,
        subCategory: p.subCategory,
        brand: p.brand ? p.brand.name : 'null'
      }, null, 2));
    });

    console.log('\n--- API SEARCH VERIFICATION ---');
    
    const endpoints = [
      `/api/products?category=${gasStoveCat.slug}`,
      `/api/products?category=${gasStoveCat.slug}&childCategory=Gas%20Stove`,
      `/api/products?category=${gasStoveCat.slug}&childCategory=Chimney`,
      `/api/products?category=${fanCat.slug}&childCategory=Fan`,
      `/api/products?category=${fanCat.slug}&childCategory=Air%20Cooler`
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTesting: GET ${endpoint}`);
      const data = await fetchApi(`http://localhost:5000${endpoint}`);
      console.log(`Total products returned: ${data.products ? data.products.length : 0}`);
      console.log(`Product names returned:`, data.products ? data.products.map(p => p.name) : []);
      
      // We will print the expected mongo query to fulfill the requirement
      const urlParams = new URLSearchParams(endpoint.split('?')[1]);
      let mongoQuery = { category: urlParams.get('category') === gasStoveCat.slug ? gasStoveCat._id.toString() : fanCat._id.toString() };
      if (urlParams.get('childCategory')) {
        mongoQuery.childCategory = urlParams.get('childCategory');
      }
      console.log(`Internal Mongo Query expected:`, JSON.stringify(mongoQuery));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyTruth();
