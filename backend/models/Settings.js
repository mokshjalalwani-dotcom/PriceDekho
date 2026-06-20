import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // WhatsApp enquiry
  whatsappNumber: { type: String, default: '' },
  
  // UPI payment
  upiId: { type: String, default: '' },
  upiQrImage: { type: String, default: '' },
  upiEnabled: { type: Boolean, default: false },
  
  // COD advance payment
  codAdvanceEnabled: { type: Boolean, default: true },
  codAdvancePercent: { type: Number, default: 50 },
  
  // Order limits
  maxOrderQuantity: { type: Number, default: 10 },
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
