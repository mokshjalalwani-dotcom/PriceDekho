import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  displayOrder: { type: Number, default: 0, unique: true },
  subCategories: [{
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true },
  iconKey: { 
    type: String, 
    enum: ['tv', 'refrigerator', 'ac', 'washing-machine', 'oven', 'sound-system', 'dishwasher', 'fan', 'mixer', 'water-purifier', 'gas-stove', 'ghar-ghanti', 'projector', 'vacuum-cleaner', 'geyser', 'personal-care'] 
  }
}, {
  timestamps: true,
});

categorySchema.pre('save', function(next) {
  if (this.subCategories && this.subCategories.length > 0) {
    const names = this.subCategories.map(sub => sub.name.toLowerCase());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      return next(new Error('Duplicate subcategory names are not allowed within a category.'));
    }
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
