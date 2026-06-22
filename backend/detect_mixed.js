import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

async function check() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const directUri = mongoUri.replace('mongodb+srv://', 'mongodb://').replace('pricedekho.akrjdfp.mongodb.net', 'ac-i8xowb1-shard-00-00.akrjdfp.mongodb.net:27017,ac-i8xowb1-shard-00-01.akrjdfp.mongodb.net:27017,ac-i8xowb1-shard-00-02.akrjdfp.mongodb.net:27017') + (mongoUri.includes('?') ? '&' : '?') + 'ssl=true&replicaSet=atlas-m0z0z0-shard-0&authSource=admin';

    await mongoose.connect(directUri);
    
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    
    let objectIds = 0;
    let strings = 0;
    let others = 0;
    
    for (const p of products) {
      if (!p.category) {
        others++;
      } else if (p.category instanceof mongoose.Types.ObjectId) {
        objectIds++;
      } else if (typeof p.category === 'string') {
        strings++;
      } else {
        others++;
      }
    }
    
    console.log(`Total Products: ${products.length}`);
    console.log(`Category as ObjectId: ${objectIds}`);
    console.log(`Category as String (slug): ${strings}`);
    console.log(`Category as Other: ${others}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
