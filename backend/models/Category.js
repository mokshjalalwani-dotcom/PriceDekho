import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  subCategories: [{ type: String }],
  isActive: { type: Boolean, default: true },
  iconKey: { 
    type: String, 
    enum: ['tv', 'refrigerator', 'ac', 'washing-machine', 'oven', 'sound-system', 'dishwasher', 'fan', 'mixer', 'water-purifier', 'gas-stove', 'ghar-ghanti', 'projector', 'vacuum-cleaner', 'geyser', 'personal-care'] 
  }
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
