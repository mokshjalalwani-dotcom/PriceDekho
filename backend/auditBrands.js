import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './models/Brand.js';
import Category from './models/Category.js';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://developer:1234@cluster0.mongodb.net/pricedekho?retryWrites=true&w=majority')
  .then(async () => {
    console.log('MongoDB Connected');
    
    const categories = await Category.find({});
    console.log(`Found ${categories.length} Categories`);
    categories.forEach(c => console.log(`- ${c.name} (${c.slug}) -> ID: ${c._id.toString()}`));

    const brands = await Brand.find({});
    console.log(`\nFound ${brands.length} Brands`);
    brands.forEach(b => {
      const catIds = b.categories.map(id => id.toString());
      const catNames = catIds.map(id => categories.find(c => c._id.toString() === id)?.name || id);
      console.log(`- ${b.name} mapped to: ${catNames.join(', ')}`);
    });

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });
