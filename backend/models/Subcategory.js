import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  childCategory: { type: String, default: '' }
}, {
  timestamps: true,
});

// Compound unique index to prevent duplicate slugs within the same category
subcategorySchema.index({ category: 1, slug: 1 }, { unique: true });

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;
