import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function validateMixedRefs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    console.log("=== Mixed References Validation ===");
    
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    
    let violations = 0;
    
    products.forEach((p, index) => {
      // Check Category
      if (p.category && !(p.category instanceof mongoose.Types.ObjectId)) {
        console.error(`[VIOLATION] Product "${p.name}" (ID: ${p._id}) has non-ObjectId Category: ${p.category}`);
        violations++;
      }
      
      // Check Brand
      if (p.brand && !(p.brand instanceof mongoose.Types.ObjectId)) {
        console.error(`[VIOLATION] Product "${p.name}" (ID: ${p._id}) has non-ObjectId Brand: ${p.brand}`);
        violations++;
      }
    });
    
    if (violations === 0) {
      console.log("[SUCCESS] No mixed references found. All category and brand mappings are strict ObjectIds.");
    } else {
      console.error(`\n[FAILED] Found ${violations} schema violations!`);
    }
    
    process.exit(violations > 0 ? 1 : 0);
  } catch (err) {
    console.error('Validation failed:', err);
    process.exit(1);
  }
}

validateMixedRefs();
