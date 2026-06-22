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

brandSchema.pre('save', async function () {
  // Prevent duplicate category references
  if (this.categories && this.categories.length > 0) {
    this.categories = [...new Set(this.categories.map(c => c.toString()))];

    // Verify all referenced ObjectIds exist in Category collection, and auto-remove orphaned IDs
    const existingCategories = await Category.find({ _id: { $in: this.categories } });
    const existingIds = existingCategories.map(c => c._id.toString());
    this.categories = this.categories.filter(c => existingIds.includes(c));
  }
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
