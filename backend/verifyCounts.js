import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from './models/Brand.js';
import Category from './models/Category.js';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

async function verify() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://developer:1234@cluster0.mongodb.net/pricedekho?retryWrites=true&w=majority');
  
  const categories = await Category.find({});
  const brands = await Brand.find({});

  const getCount = (slug, expectedList) => {
    const cat = categories.find(c => c.slug === slug);
    if (!cat) return 0;
    const catBrands = brands.filter(b => b.categories.some(id => id.toString() === cat._id.toString()));
    
    console.log(`${cat.name}: ${catBrands.length} brands (Expected: ${expectedList.length})`);
    
    // Find missing
    const missing = expectedList.filter(name => !catBrands.some(b => b.name.toLowerCase() === name.toLowerCase()));
    if (missing.length > 0) {
      console.log(`  -> Missing: ${missing.join(', ')}`);
      missing.forEach(name => {
        const found = brands.find(b => b.name.toLowerCase() === name.toLowerCase());
        if (found) {
            console.log(`     (Found ${found.name} in DB, isActive: ${found.isActive}, categories: ${found.categories.length})`);
        }
      });
    }
  };

  getCount('tv', ["Samsung", "Sony", "VU", "TCL", "Hisense", "Wobble"]);
  getCount('air-conditioners', ["Daikin", "Mitsubishi Heavy Duty", "Mitsubishi Electric", "Onida", "Samsung", "Haier", "Panasonic", "Hisense", "Wybor", "Hitachi", "Voltas", "Lloyd"]);
  getCount('mixer', ["Philips", "Sujata", "Usha", "Agaro", "Boss", "Haier", "Maharaja", "Lee Star", "Wonderchef", "Lifelong", "Morphy Richards"]);
  getCount('personal-care', ["Philips"]);

  mongoose.disconnect();
}

verify();
