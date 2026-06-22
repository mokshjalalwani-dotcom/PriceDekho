import mongoose from 'mongoose';
import Category from './Category.js';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  logo: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
}, {
  timestamps: true,
});

brandSchema.pre('save', async function (next) {
  // Prevent duplicate category references
  if (this.categories && this.categories.length > 0) {
    this.categories = [...new Set(this.categories.map(c => c.toString()))];

    // Verify all referenced ObjectIds exist in Category collection
    const existingCategories = await Category.find({ _id: { $in: this.categories } });
    if (existingCategories.length !== this.categories.length) {
      return next(new Error('One or more referenced Category ObjectIds do not exist in the database.'));
    }
  }
  next();
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
