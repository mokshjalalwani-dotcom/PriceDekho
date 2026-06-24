import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api';

const customFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
  }
  return res.json();
};

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('--- STARTING 4-TIER HIERARCHY VERIFICATION ---\n');

    // 1. Admin Login (Generate Token directly)
    console.log('1. Generating Admin Token...');
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) throw new Error('No admin user found');
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✓ Admin login successful\n');

    // 2. Fetch Data
    const categories = await customFetch(`${API_URL}/categories`);
    const gasStoveCat = categories.find(c => c.slug === 'gas-stove');
    const fanCat = categories.find(c => c.slug === 'fan');

    const brands = await customFetch(`${API_URL}/brands`);
    const prestigeBrand = brands.find(b => b.name.toLowerCase().includes('prestige')) || brands[0];
    const havellsBrand = brands.find(b => b.name.toLowerCase().includes('havells')) || brands[0];

    console.log('✓ Fetched categories and brands\n');

    // 3. Create Subcategories (Testing Admin Add Subcategory)
    console.log('2. Creating Test Subcategories...');
    const testSubs = [
      { name: '2 Burner Test', slug: '2-burner-test', category: gasStoveCat._id, childCategory: 'Gas Stove', displayOrder: 99 },
      { name: 'Wall Mounted Test', slug: 'wall-mounted-test', category: gasStoveCat._id, childCategory: 'Chimney', displayOrder: 99 },
      { name: 'Ceiling Test', slug: 'ceiling-test', category: fanCat._id, childCategory: 'Fan', displayOrder: 99 },
      { name: 'Desert Test', slug: 'desert-test', category: fanCat._id, childCategory: 'Air Cooler', displayOrder: 99 }
    ];

    const createdSubs = [];
    for (const sub of testSubs) {
      try {
        const data = await customFetch(`${API_URL}/admin/subcategories`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(sub)
        });
        createdSubs.push(data);
        console.log(`  ✓ Created subcategory: ${sub.name} (Child: ${sub.childCategory})`);
      } catch (err) {
        if (err.message.includes('400')) {
           // Fetch existing
           const existing = await customFetch(`${API_URL}/admin/subcategories?category=${sub.category}`, { headers: authHeaders });
           const found = existing.find(s => s.slug === sub.slug);
           if (found) createdSubs.push(found);
           console.log(`  - Subcategory ${sub.name} already exists.`);
        } else {
           throw err;
        }
      }
    }
    console.log('');

    // 4. Add Products
    console.log('3. Testing "Add Product"...');
    const testProducts = [
      {
        name: 'Test Gas Stove Product 123',
        slug: 'test-gas-stove-product-123',
        description: 'Test Description',
        category: gasStoveCat._id,
        childCategory: 'Gas Stove',
        subCategory: '2 Burner Test',
        brand: prestigeBrand._id,
        sellingPrice: 1000, mrp: 1200, stock: 10, images: ['test.jpg']
      },
      {
        name: 'Test Chimney Product 456',
        slug: 'test-chimney-product-456',
        description: 'Test Description',
        category: gasStoveCat._id,
        childCategory: 'Chimney',
        subCategory: 'Wall Mounted Test',
        brand: prestigeBrand._id,
        sellingPrice: 5000, mrp: 6000, stock: 5, images: ['test.jpg']
      },
      {
        name: 'Test Fan Product 789',
        slug: 'test-fan-product-789',
        description: 'Test Description',
        category: fanCat._id,
        childCategory: 'Fan',
        subCategory: 'Ceiling Test',
        brand: havellsBrand._id,
        sellingPrice: 2000, mrp: 2500, stock: 15, images: ['test.jpg']
      },
      {
        name: 'Test Air Cooler Product 012',
        slug: 'test-air-cooler-product-012',
        description: 'Test Description',
        category: fanCat._id,
        childCategory: 'Air Cooler',
        subCategory: 'Desert Test',
        brand: havellsBrand._id,
        sellingPrice: 8000, mrp: 9000, stock: 8, images: ['test.jpg']
      }
    ];

    const createdProducts = [];
    for (const prod of testProducts) {
      // Clean up previous
      try {
        const exist = await customFetch(`${API_URL}/products/${prod.slug}`);
        if (exist) {
          await customFetch(`${API_URL}/admin/products/${exist._id}`, { method: 'DELETE', headers: authHeaders });
        }
      } catch (e) { /* doesn't exist */ }

      const data = await customFetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(prod)
      });
      createdProducts.push(data);
      console.log(`  ✓ Added product: ${prod.name} -> [${prod.childCategory} > ${prod.subCategory}]`);
    }
    console.log('');

    // 5. Edit Product
    console.log('4. Testing "Edit Product"...');
    const productToEdit = createdProducts[0];
    const editRes = await customFetch(`${API_URL}/admin/products/${productToEdit._id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        ...productToEdit,
        sellingPrice: 1100, // changed price
        category: productToEdit.category._id || productToEdit.category,
        brand: productToEdit.brand._id || productToEdit.brand
      })
    });
    if (editRes.sellingPrice === 1100 || editRes.product?.sellingPrice === 1100) {
      console.log(`  ✓ Successfully edited product price to 1100\n`);
    } else {
      console.error('Edit result:', editRes);
      throw new Error('Edit product failed.');
    }

    // 6. Product Details API
    console.log('5. Testing "Product Details page"...');
    const detailsRes = await customFetch(`${API_URL}/products/${productToEdit.slug}`);
    if (detailsRes.childCategory === 'Gas Stove' && detailsRes.subCategory === '2 Burner Test') {
      console.log(`  ✓ Product Details API returned correct hierarchy fields\n`);
    } else {
      throw new Error('Product details missing hierarchy fields.');
    }

    // 7. Shop Filters (Search, Brand, Category, Child Category, Subcategory)
    console.log('6. Testing Shop Filters...');

    // Search
    const searchRes = await customFetch(`${API_URL}/products?keyword=Test%20Gas%20Stove`);
    if (searchRes.products.some(p => p._id === productToEdit._id)) {
      console.log(`  ✓ Search filtering works (?keyword=Test Gas Stove)`);
    } else throw new Error('Search failed.');

    // Brand
    const brandRes = await customFetch(`${API_URL}/products?brand=${prestigeBrand.slug}`);
    if (brandRes.products.some(p => p._id === productToEdit._id)) {
      console.log(`  ✓ Brand filtering works (?brand=${prestigeBrand.slug})`);
    } else throw new Error('Brand filter failed.');

    // Category
    const catRes = await customFetch(`${API_URL}/products?category=gas-stove`);
    if (catRes.products.some(p => p.name === 'Test Gas Stove Product 123') && 
        catRes.products.some(p => p.name === 'Test Chimney Product 456')) {
      console.log(`  ✓ Category filtering works (?category=gas-stove)`);
    } else throw new Error('Category filter failed.');

    // Child Category
    const childCatRes = await customFetch(`${API_URL}/products?category=gas-stove&childCategory=Chimney`);
    if (childCatRes.products.some(p => p.name === 'Test Chimney Product 456') &&
        !childCatRes.products.some(p => p.name === 'Test Gas Stove Product 123')) {
      console.log(`  ✓ Child Category filtering works (?childCategory=Chimney)`);
    } else throw new Error('Child Category filter failed.');

    // Subcategory
    const subCatRes = await customFetch(`${API_URL}/products?category=fan&childCategory=Fan&subCategory=Ceiling%20Test`);
    if (subCatRes.products.some(p => p.name === 'Test Fan Product 789') &&
        !subCatRes.products.some(p => p.name === 'Test Air Cooler Product 012')) {
      console.log(`  ✓ Subcategory filtering works (?subCategory=Ceiling Test)`);
    } else throw new Error('Subcategory filter failed.');

    console.log('\n--- ALL TESTS PASSED SUCCESSFULLY! ---');

    // Clean up
    for (const prod of createdProducts) {
      await customFetch(`${API_URL}/admin/products/${prod._id}`, { method: 'DELETE', headers: authHeaders });
    }
    for (const sub of createdSubs) {
      await customFetch(`${API_URL}/admin/subcategories/${sub._id}`, { method: 'DELETE', headers: authHeaders });
    }
    console.log('\nCleaned up test data.');
    
    process.exit(0);

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    console.error(error);
    process.exit(1);
  }
};

runTests();
