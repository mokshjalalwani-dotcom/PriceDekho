import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // WhatsApp enquiry
  whatsappNumber: { type: String, default: '' },
  
  // Payments Config
  isCodEnabled: { type: Boolean, default: true },
  isUpiEnabled: { type: Boolean, default: true },
  isRazorpayEnabled: { type: Boolean, default: false }, // Future-proofing
  
  // UPI Specifics
  upiMerchantName: { type: String, default: '' },
  upiId: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  
  // Advance Payment
  advancePaymentEnabled: { type: Boolean, default: false },
  advancePaymentType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  advancePaymentPercentage: { type: Number, default: 20 },
  advancePaymentFixed: { type: Number, default: 500 },
  applicableAdvanceMethods: [{ type: String, default: 'cod' }], // e.g. ['cod']
  
  // Shipping
  shippingEnabled: { type: Boolean, default: true },
  shippingCharge: { type: Number, default: 60 },
  freeShippingThreshold: { type: Number, default: 999 },
  
  // Tax
  gstPercentage: { type: Number, default: 18 },
  
  // Order Configs
  autoConfirmOrders: { type: Boolean, default: false },
  allowGuestCheckout: { type: Boolean, default: true },
  invoicePrefix: { type: String, default: 'ORD-' },

  // Order limits
  maxOrderQuantity: { type: Number, default: 10 },

  // Integrations
  googleSheetUrl: { type: String, default: '' },
}, {
  timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
