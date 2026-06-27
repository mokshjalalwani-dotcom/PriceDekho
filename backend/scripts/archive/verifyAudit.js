import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';

const runVerification = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/satguru-smartshop');
    
    console.log('\n--- 1. Category Schema vs Database Mismatch ---');
    const gasStoveCat = await Category.findOne({ slug: 'gas-stove' }).lean();
    console.log('Gas Stove Category Document from MongoDB (.lean()):');
    console.log(JSON.stringify(gasStoveCat, null, 2));

    console.log('\n--- 3. Mixed Category Logic Verification ---');
    const gasStoveProducts = await Product.find({ category: gasStoveCat._id }).select('name subCategory childCategory').lean();
    console.log('Products in Gas Stove category:');
    gasStoveProducts.forEach(p => console.log(`- ${p.name} | subCategory: ${p.subCategory} | childCategory: ${p.childCategory}`));

    console.log('\n--- 4. Brand Mapping Verification ---');
    const brand = await Brand.findOne().lean();
    console.log('Sample Brand document (.lean()):');
    console.log(JSON.stringify(brand, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runVerification();
