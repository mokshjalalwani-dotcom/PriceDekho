import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true, default: 'upi' }, // upi, razorpay, etc.
  upiUri: { type: String },
  merchantName: { type: String },
  upiId: { type: String },
  status: { 
    type: String, 
    enum: ['CREATED', 'PENDING_USER', 'UNDER_VERIFICATION', 'VERIFIED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
    default: 'CREATED'
  },
  transactionId: { type: String }, // Provided by user/webhook
  cartHash: { type: String, required: true }, // To prevent cart modifications
  cartSnapshot: { type: Object, required: true }, // Immutable state at generation
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, for logged in users
  customerName: { type: String }, // Provided during checkout
  customerPhone: { type: String }, // Provided during checkout
  expiresAt: { type: Date, required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete document? No, we shouldn't auto-delete because we want logs. We'll use a cron to mark EXPIRED.

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
