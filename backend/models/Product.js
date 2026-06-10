import mongoose from 'mongoose';

// --- Sub-schemas ---
const specFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldValue: { type: String, required: true }
}, { _id: true });

const specGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  fields: [specFieldSchema]
}, { _id: true });

const variantSchema = new mongoose.Schema({
  variantName: { type: String, required: true },
  color: { type: String },
  sellingPrice: { type: Number },
  mrp: { type: Number },
  countInStock: { type: Number, default: 0 }
}, { _id: true });

// --- Category-specific fields (Mixed/flexible) ---
const categoryFieldsSchema = new mongoose.Schema({
  // TV
  screenSize: String,
  displayType: String,
  resolution: String,
  smartTv: String,
  operatingSystem: String,
  refreshRate: String,
  hdmiPorts: String,
  usbPorts: String,
  speakerOutput: String,
  connectivity: String,
  wallMountIncluded: String,
  energyRating: String,

  // Fridge
  capacityLitres: String,
  doorType: String,
  energyStarRating: String,
  compressorType: String,
  inverterTechnology: String,
  coolingTechnology: String,
  defrostType: String,
  freezerCapacity: String,
  shelfType: String,
  stabilizerRequired: String,

  // Fan
  fanType: String,
  sweepSize: String,
  speedSettings: String,
  rpm: String,
  powerConsumption: String,
  bladeMaterial: String,
  numberOfBlades: String,
  remoteControl: String,
  noiseLevel: String,

  // Mixer
  motorPowerWatts: String,
  numberOfJars: String,
  jarMaterial: String,
  overloadProtection: String,
  bladeType: String,
  bodyMaterial: String,
  suitableFor: String,
  safetyLock: String,

  // RO Water Purifier
  purificationTechnology: String,
  roUvUfType: String,
  storageCapacity: String,
  purificationCapacity: String,
  filterType: String,
  tdsController: String,
  installationType: String,
  waterSource: String,
  indicatorAvailability: String,

  // Ghar-Ghanti
  motorPower: String,
  grindingCapacity: String,
  hopperCapacity: String,
  stoneType: String,
  cabinetMaterial: String,
  automaticOperation: String,
  childSafetyLock: String,
  suitableGrains: String,

  // Sound System
  speakerType: String,
  channelConfiguration: String,
  outputPower: String,
  bluetooth: String,
  usbSupport: String,
  auxSupport: String,
  hdmiArcSupport: String,
  subwooferIncluded: String,
  fmSupport: String,

  // AC
  acType: String,
  acSubType: String,
  capacityTons: String,
  starRating: String,
  coolingCapacity: String,
  condenserCoilMaterial: String,
  refrigerantType: String,
  roomSizeCoverage: String,

  // Washing Machine
  capacityKg: String,
  washerType: String,
  loadType: String,
  washPrograms: String,
  inverterMotor: String,
  drumMaterial: String,
  waterLevelSelection: String,
  childLock: String,
  dryerFunction: String,

  // Oven
  ovenType: String,
  ovenSubType: String,
  capacityLitresOven: String,
  autoCookMenu: String,
  grillFunction: String,
  convectionFunction: String,
  timer: String,
  temperatureControl: String,
  turntable: String,

  // Gas Stove
  numberOfBurners: String,
  burnerMaterial: String,
  ignitionType: String,
  glassTop: String,
  isiCertified: String,
  panSupportMaterial: String,
  spillTray: String,

  // Dishwasher
  placeSettings: String,
  numberOfWashPrograms: String,
  waterConsumption: String,
  halfLoadOption: String,
  dryingFeature: String,
  suitableUtensils: String,
}, { _id: false, strict: false });

// --- Main Product Schema ---
const productSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  modelNumber: { type: String, default: '' },
  color: { type: String, default: '' },
  subCategory: { type: String, default: '' },

  // Pricing
  sellingPrice: { type: Number, required: true },
  mrp: { type: Number },
  discountPercentage: { type: Number, default: 0 },
  offerPrice: { type: Number },

  // Legacy price field alias (for backward compatibility)
  price: { type: Number },

  // Stock & Availability
  countInStock: { type: Number, default: 0, min: 0 },
  availability: {
    type: String,
    enum: ['In Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  isVisible: { type: Boolean, default: true },

  // Content
  shortDescription: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  // Legacy field alias
  detailedDescription: { type: String },

  highlights: [{ type: String }],
  boxContents: [{ type: String }],
  warrantyDetails: { type: String, default: '' },
  tags: [{ type: String }],

  // Images
  mainImage: { type: String, default: '' },
  galleryImages: [{ type: String }],
  // Legacy images array (backward compatibility)
  images: [{ type: String }],

  // Variants
  variants: [variantSchema],

  // Dynamic Specification Groups
  specGroups: [specGroupSchema],

  // Legacy flat specifications map (backward compat)
  specifications: { type: Map, of: String },

  // Category-Specific Fields
  categoryFields: { type: categoryFieldsSchema, default: () => ({}) },

  // Flags
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// --- Pre-validate hooks ---
productSchema.pre('validate', function () {
  // Auto-set availability based on stock
  if (this.countInStock <= 0) {
    this.availability = 'Out of Stock';
  }

  // Sync price ↔ sellingPrice for backward compatibility
  if (this.sellingPrice && !this.price) {
    this.price = this.sellingPrice;
  } else if (this.price && !this.sellingPrice) {
    this.sellingPrice = this.price;
  }

  // Auto-calculate discount percentage
  if (this.mrp && this.sellingPrice && this.mrp > this.sellingPrice) {
    this.discountPercentage = Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
  }

  // Sync images arrays
  if (this.mainImage && (!this.images || this.images.length === 0)) {
    this.images = [this.mainImage, ...this.galleryImages];
  }
  if (this.images && this.images.length > 0 && !this.mainImage) {
    this.mainImage = this.images[0];
    this.galleryImages = this.images.slice(1);
  }
});

// Text search index
productSchema.index({ name: 'text', tags: 'text', shortDescription: 'text' });

// Performance Indexes for common queries
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ availability: 1 });
productSchema.index({ modelNumber: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
