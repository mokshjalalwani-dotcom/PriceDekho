import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    await mongoose.connection.collection('products').dropIndex('sku_1');
    console.log('Successfully dropped sku_1 index from database!');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index already dropped or not found. All good!');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    mongoose.connection.close();
  }
};

dropIndex();
