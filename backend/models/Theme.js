import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  primary: { type: String, default: '#FF6600' },
  primaryLight: { type: String, default: '#FFF3E0' },
  primaryDark: { type: String, default: '#E65C00' },
  primaryHover: { type: String, default: '#E65C00' },
  primaryFocus: { type: String, default: '#FF8533' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
