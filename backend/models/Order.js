import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  slug: { type: String, default: '' },
  brand: { type: String, default: '' },
  category: { type: String, default: '' },
  childCategory: { type: String, default: '' },
  subCategory: { type: String, default: '' },
  sku: { type: String, default: '' },
  mainImage: { type: String, required: true },
  mrp: { type: Number, default: 0 },
  sellingPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  priceAtPurchase: { type: Number, required: true },
  qty: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  orderItems: [orderItemSchema],
  
  // Financial fields
  itemsPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  discountPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 }, // Subtotal
  finalPayable: { type: Number, required: true, default: 0.0 }, // Grand total
  
  paymentMethod: { type: String, default: 'cod' },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  
  // Advance Payment
  advancePaid: { type: Boolean, default: false },
  advanceAmount: { type: Number, default: 0 },
  
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
    default: 'Pending',
  },
  adminMessage: { type: String, default: '' },
  idempotencyKey: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Performance indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ isPaid: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
