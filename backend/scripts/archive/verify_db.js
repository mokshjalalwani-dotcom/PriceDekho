import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  displayOrder: Number,
  subCategories: [String],
  isActive: Boolean,
  iconKey: String,
});
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const brandSchema = new mongoose.Schema({
  name: String,
  slug: String,
  logo: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  isActive: Boolean
});
const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  category: String,
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("=== DB Verification ===");
    
    // 1 & 2. Total category count & exact display order
    const categories = await Category.find().sort({ displayOrder: 1 });
    console.log(`\n1. Category Count: ${categories.length}`);
    console.log("2. Exact display order:");
    categories.forEach(c => console.log(`   [${c.displayOrder}] ${c.name} (Slug: ${c.slug})`));
    
    // 3. Product count
    const productCount = await Product.countDocuments();
    console.log(`\n3. Product Count: ${productCount}`);
    
    // 4. Brand count and category mappings
    const brands = await Brand.find().populate('categories', 'name slug');
    console.log(`\n4. Brand Count: ${brands.length}`);
    console.log("   Brand Mappings:");
    brands.forEach(b => {
      const mappedCats = b.categories ? b.categories.map(c => c.slug).join(', ') : 'None';
      console.log(`   - ${b.name}: ${mappedCats}`);
    });
    
    // 5. Personal Care subcategories
    const personalCare = categories.find(c => c.slug === 'personal-care');
    console.log(`\n5. Personal Care Subcategories: ${personalCare && personalCare.subCategories ? personalCare.subCategories.join(', ') : 'Not Found'}`);
    
    // 6. Fan & Air Cooler subcategories
    const fan = categories.find(c => c.slug === 'fan');
    console.log(`6. Fan Subcategories: ${fan && fan.subCategories ? fan.subCategories.join(', ') : 'Not Found'}`);
    
    // 7. Gas Stove & Chimney subcategories
    const gasStove = categories.find(c => c.slug === 'gas-stove');
    console.log(`7. Gas Stove Subcategories: ${gasStove && gasStove.subCategories ? gasStove.subCategories.join(', ') : 'Not Found'}`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
