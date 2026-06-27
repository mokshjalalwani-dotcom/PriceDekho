import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for MongoDB Atlas ECONNREFUSED SRV errors
dns.setServers(['8.8.8.8', '8.8.4.4']);

import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Product from './models/Product.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');

// --- 1. Target Categories Mapping ---
const targetCategories = [
  { name: 'Television', slug: 'tv', iconKey: 'tv', displayOrder: 1 },
  { name: 'Projector', slug: 'projector', iconKey: 'projector', displayOrder: 2 },
  { name: 'Sound System', slug: 'sound-system', iconKey: 'sound-system', displayOrder: 3 },
  { name: 'Refrigerator', slug: 'refrigerator', iconKey: 'refrigerator', displayOrder: 4 },
  { name: 'Washing Machine', slug: 'washing-machines', iconKey: 'washing-machine', displayOrder: 5 },
  { name: 'Dish Washer', slug: 'dishwashers', iconKey: 'dishwasher', displayOrder: 6 },
  { name: 'Air Conditioner', slug: 'air-conditioners', iconKey: 'ac', displayOrder: 7 },
  { name: 'Fan & Air Cooler', slug: 'fan', iconKey: 'fan', displayOrder: 8, subCategories: ['Fan', 'Air Cooler'] },
  { name: 'Vacuum Cleaner', slug: 'vacuum-cleaner', iconKey: 'vacuum-cleaner', displayOrder: 9 },
  { name: 'Ghar Ghanti (Aata Maker)', slug: 'ghar-ghanti', iconKey: 'ghar-ghanti', displayOrder: 10 },
  { name: 'Oven', slug: 'oven', iconKey: 'oven', displayOrder: 11 },
  { name: 'Water Purifier', slug: 'water-purifier', iconKey: 'water-purifier', displayOrder: 12 },
  { name: 'Kitchen Appliance', slug: 'mixer', iconKey: 'mixer', displayOrder: 13, subCategories: ['Mixer'] },
  { name: 'Gas Stove & Chimney', slug: 'gas-stove', iconKey: 'gas-stove', displayOrder: 14, subCategories: ['Gas Stove', 'Chimney'] },
  { name: 'Geyser', slug: 'gyser', iconKey: 'geyser', displayOrder: 15 },
  { 
    name: 'Personal Care', 
    slug: 'personal-care', 
    iconKey: 'personal-care', 
    displayOrder: 16,
    subCategories: ['Trimmer', 'One Blade', 'Body Groomer', 'Nose Ear & Eyebrow Trimmer', 'Hair Straightener', 'Hair Dryer', 'Hair Straightener Brush', 'Styler', 'Epilator', 'Shaver', 'Female Trimmer', 'Hair Clipper']
  }
];

// --- 2. Excel Brand Mappings ---
const brandMappings = {
  'tv': ["SAMSUNG", "SONY", "VU", "TCL", "HISENSE", "WOBBLE"],
  'projector': ["ZEBRONICS"],
  'sound-system': ["ZEBRONICS", "SAMSUNG", "SONY", "JBL"],
  'refrigerator': ["SAMSUNG", "HAIER"],
  'washing-machines': ["SAMSUNG", "HAIER", "IFB"],
  'dishwashers': ["IFB", "BOSCH", "TOSHIBA"],
  'air-conditioners': ["DAIKIN", "MITSUBISHI HEAVY DUTY", "MITSUBISHI ELECTRIC", "ONIDA", "SAMSUNG", "HAIER", "PANASONIC", "HISENSE", "WYBOR", "HITACHI", "VOLTAS", "LLOYD"],
  'fan': ["FAN-CROMPTON", "FAN-ORIENT", "AIR COOLER-SYMPHONY", "AIR COOLER-WYBOR"],
  'vacuum-cleaner': ["EUREKA FOBES"],
  'ghar-ghanti': ["MYCROFINE"],
  'oven': ["SAMSUNG", "HAIER", "IFB"],
  'water-purifier': ["AQUAGAURD", "H2O"],
  'mixer': ["PHILIPS", "SUJATA", "USHA", "AGARO", "BOSS", "HAIER", "MAHARAJA", "LEE STAR", "WONDERCHEF", "LIFELONG", "MORPHY RICHARDS"],
  'gas-stove': ["ELICAS", "SUNSHINE", "SUJATA"],
  'gyser': ["BAJAJ", "HAIER", "HAVELLS", "BENCHMARK"],
  'personal-care': ["PHILIPS"]
};

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to Database. Mode: ${isDryRun ? 'DRY RUN' : 'PRODUCTION MIGRATION'}`);

    // --- Create Backup ---
    const allCategories = await Category.find().lean();
    const allBrands = await Brand.find().lean();
    const allProducts = await Product.find().lean();
    
    const beforeCatCount = allCategories.length;
    const beforeBrandCount = allBrands.length;
    const beforeProductCount = allProducts.length;
    
    console.log(`\nFound ${beforeCatCount} Categories, ${beforeBrandCount} Brands, ${beforeProductCount} Products.`);

    const backupData = {
      timestamp: new Date().toISOString(),
      categories: allCategories,
      brands: allBrands,
      products: allProducts
    };

    const backupFile = path.join(__dirname, `backup_${new Date().getTime()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`\n[SUCCESS] Backup created at ${backupFile}`);

    // --- State Holders ---
    const plannedCategoryUpserts = [];
    const plannedBrandUpserts = [];
    const plannedProductUpdates = [];
    const existingBrandMap = new Map(); // slug -> document
    allBrands.forEach(b => existingBrandMap.set(b.slug, b));

    // 1. Process Categories
    console.log('\n--- Processing Categories ---');
    for (const targetCat of targetCategories) {
      const existingCat = allCategories.find(c => c.slug === targetCat.slug);
      let catId;
      if (existingCat) {
        catId = existingCat._id;
        plannedCategoryUpserts.push({
          action: 'UPDATE',
          id: existingCat._id,
          name: targetCat.name,
          slug: targetCat.slug,
          iconKey: targetCat.iconKey,
          displayOrder: targetCat.displayOrder,
          subCategories: targetCat.subCategories || existingCat.subCategories || [],
          isActive: true
        });
      } else {
        catId = new mongoose.Types.ObjectId();
        plannedCategoryUpserts.push({
          action: 'CREATE',
          id: catId,
          name: targetCat.name,
          slug: targetCat.slug,
          iconKey: targetCat.iconKey,
          displayOrder: targetCat.displayOrder,
          subCategories: targetCat.subCategories || [],
          isActive: true
        });
      }

      // If combined category, update products to set default subcategory
      if (targetCat.subCategories && targetCat.subCategories.length > 0 && existingCat) {
        // Find products belonging to this category that don't have a subcategory or have an invalid one
        const productsInCat = allProducts.filter(p => String(p.category) === String(existingCat._id));
        const defaultSubCat = targetCat.subCategories[0]; // e.g. "Fan", "Mixer", "Gas Stove"
        
        productsInCat.forEach(p => {
          if (!p.subCategory || !targetCat.subCategories.includes(p.subCategory)) {
            plannedProductUpdates.push({
              action: 'UPDATE',
              id: p._id,
              name: p.name,
              categorySlug: targetCat.slug,
              newSubCategory: defaultSubCat
            });
          }
        });
      }

      // 2. Process Brands for this category
      const mappedBrandNames = brandMappings[targetCat.slug] || [];
      for (const bName of mappedBrandNames) {
        const bSlug = generateSlug(bName);
        let existingBrand = plannedBrandUpserts.find(b => b.slug === bSlug);
        if (!existingBrand) {
           const dbBrand = existingBrandMap.get(bSlug);
           if (dbBrand) {
             existingBrand = { action: 'UPDATE', id: dbBrand._id, name: dbBrand.name, slug: dbBrand.slug, categories: [...(dbBrand.categories || [])].map(String) };
           } else {
             existingBrand = { action: 'CREATE', id: new mongoose.Types.ObjectId(), name: bName, slug: bSlug, categories: [] };
           }
           plannedBrandUpserts.push(existingBrand);
        }
        
        // Add this category ID to brand's categories
        if (!existingBrand.categories.includes(String(catId))) {
          existingBrand.categories.push(String(catId));
        }
      }
    }

    // Output formatted dry run details
    console.log(`\n=== MIGRATION PLAN SUMMARY ===`);
    console.log(`Categories to Update: ${plannedCategoryUpserts.filter(c => c.action === 'UPDATE').length}`);
    console.log(`Categories to Create: ${plannedCategoryUpserts.filter(c => c.action === 'CREATE').length}`);
    console.log(`Brands to Create/Update: ${plannedBrandUpserts.length}`);
    console.log(`Products to Update (Subcategory normalization): ${plannedProductUpdates.length}`);
    
    console.log(`\n=== CATEGORY & BRAND MAPPING DETAILS ===`);
    for (const cat of plannedCategoryUpserts) {
      // Find mapped brands
      const brandsForCat = plannedBrandUpserts.filter(b => b.categories.includes(String(cat.id)));
      // Find products
      let prodCount = 0;
      if (cat.action === 'UPDATE') {
        prodCount = allProducts.filter(p => String(p.category) === String(cat.id)).length;
      }
      console.log(`[${cat.displayOrder}] ${cat.name} (${cat.slug}) - ${cat.action}`);
      console.log(`    Products: ${prodCount}`);
      console.log(`    Subcategories: ${cat.subCategories.length > 0 ? cat.subCategories.join(', ') : 'None'}`);
      console.log(`    Mapped Brands: ${brandsForCat.map(b => b.name).join(', ') || 'None'}`);
      console.log(`----------------------------------------`);
    }

    if (isDryRun) {
      console.log('\n[DRY RUN COMPLETE] No changes were written to the database.');
      process.exit(0);
    }

    // --- REAL EXECUTION ---
    console.log('\n[EXECUTING MIGRATION]');
    
    // 1. Categories
    for (const c of plannedCategoryUpserts) {
      if (c.action === 'CREATE') {
        await Category.create({ _id: c.id, name: c.name, slug: c.slug, iconKey: c.iconKey, displayOrder: c.displayOrder, subCategories: c.subCategories, isActive: true });
      } else {
        await Category.findByIdAndUpdate(c.id, { name: c.name, iconKey: c.iconKey, displayOrder: c.displayOrder, subCategories: c.subCategories, isActive: true });
      }
    }

    // 2. Brands
    for (const b of plannedBrandUpserts) {
      if (b.action === 'CREATE') {
        await Brand.create({ _id: b.id, name: b.name, slug: b.slug, categories: b.categories, isActive: true });
      } else {
        await Brand.findByIdAndUpdate(b.id, { categories: b.categories });
      }
    }

    // 3. Products
    for (const p of plannedProductUpdates) {
      await Product.findByIdAndUpdate(p.id, { subCategory: p.newSubCategory });
    }

    // --- Verification ---
    const afterCatCount = await Category.countDocuments();
    const afterBrandCount = await Brand.countDocuments();
    const afterProductCount = await Product.countDocuments();

    console.log(`\n=== POST MIGRATION VERIFICATION ===`);
    console.log(`Before:`);
    console.log(`Categories: ${beforeCatCount}`);
    console.log(`Brands: ${beforeBrandCount}`);
    console.log(`Products: ${beforeProductCount}\n`);
    
    console.log(`After:`);
    console.log(`Categories: ${afterCatCount}`);
    console.log(`Brands: ${afterBrandCount}`);
    console.log(`Products: ${afterProductCount}\n`);

    const hasMismatch = beforeCatCount !== afterCatCount || beforeBrandCount !== afterBrandCount || beforeProductCount !== afterProductCount;

    if (hasMismatch) {
      console.log(`Validation Status: FAILED\n`);
      console.log(`Difference:`);
      if (beforeCatCount !== afterCatCount) console.log(`Categories: ${afterCatCount > beforeCatCount ? '+' : ''}${afterCatCount - beforeCatCount}`);
      if (beforeBrandCount !== afterBrandCount) console.log(`Brands: ${afterBrandCount > beforeBrandCount ? '+' : ''}${afterBrandCount - beforeBrandCount}`);
      if (beforeProductCount !== afterProductCount) console.log(`Products: ${afterProductCount > beforeProductCount ? '+' : ''}${afterProductCount - beforeProductCount}\n`);
      
      console.log(`Recommended Action:\nRun node restoreCategories.js ${path.basename(backupFile)}`);
      process.exit(1);
    } else {
      console.log(`Validation Status: PASSED`);
      console.log(`\n[SUCCESS] Migration completed safely.`);
      process.exit(0);
    }
    
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
