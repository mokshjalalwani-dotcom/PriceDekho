import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  logo: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
}, {
  timestamps: true,
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
