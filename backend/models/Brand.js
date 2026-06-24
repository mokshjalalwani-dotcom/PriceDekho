import mongoose from 'mongoose';
import Category from './Category.js';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  logo: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  mappedCategories: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    childCategories: [{ type: String }]
  }]
}, {
  timestamps: true,
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
