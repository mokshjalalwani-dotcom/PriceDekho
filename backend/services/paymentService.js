import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Settings from '../models/Settings.js';
import Product from '../models/Product.js';
import { generateUpiUri } from './upiService.js';
import { calculateDiscount, calculateShipping, calculateTax, calculateAdvance, calculateGrandTotal } from '../utils/pricing.js';
import logger from '../utils/logger.js';

// Generate a unique non-sequential reference
export const generatePaymentReference = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SG-${date}-${randomStr}`;
};

export const generateCartHash = (orderItems, method, amountToPay) => {
  // We hash the product IDs, quantities, method, and the calculated amountToPay
  const simplifiedCart = orderItems.map(item => ({ product: item.product, qty: item.qty })).sort((a, b) => a.product.localeCompare(b.product));
  return crypto.createHash('sha256').update(JSON.stringify({ simplifiedCart, method, amountToPay })).digest('hex');
};

export const getOrCreatePaymentSession = async (reqBody, user) => {
  const { orderItems, paymentMethod } = reqBody;

  if (!orderItems || orderItems.length === 0) {
    throw new Error('No items in cart');
  }

  const settings = await Settings.getSettings();

  // 1. Fetch fresh products and validate Max Order Qty
  const snapshotItems = [];
  let calculatedSubtotal = 0;

  for (const item of orderItems) {
    if (item.qty <= 0) throw new Error(`Invalid quantity for item ${item.name}`);
    if (settings.maxOrderQuantity && item.qty > settings.maxOrderQuantity) {
      throw new Error(`Quantity exceeds max limit of ${settings.maxOrderQuantity} for item ${item.name}`);
    }

    const product = await Product.findOne({ _id: item.product, isVisible: true });

    if (!product) {
      throw new Error(`Product unavailable or inactive: ${item.name}`);
    }

    calculatedSubtotal += (product.sellingPrice || product.price) * item.qty;
    snapshotItems.push({
      product: product._id,
      name: product.name,
      qty: item.qty,
      priceAtPurchase: product.sellingPrice || product.price
    });
  }

  // 3. Calculate Prices
  const discountPrice = calculateDiscount();
  const shippingPrice = calculateShipping(settings, calculatedSubtotal);
  const taxPrice = calculateTax(settings, calculatedSubtotal);
  const finalPayable = calculateGrandTotal(calculatedSubtotal, shippingPrice, taxPrice, discountPrice);
  const requiredAdvance = calculateAdvance(settings, paymentMethod, calculatedSubtotal);

  const amountToPay = paymentMethod === 'upi' ? finalPayable : requiredAdvance;

  if (amountToPay <= 0 && paymentMethod !== 'cod') {
    throw new Error('Calculated amount is 0. Cannot generate payment session.');
  }

  // Generate cart hash including the final payable amount so if price changes, hash changes.
  const cartHash = generateCartHash(orderItems, paymentMethod, amountToPay);

  // 3. Check for existing active session to reuse
  const activePayment = await Payment.findOne({ 
    cartHash, 
    status: 'CREATED',
    expiresAt: { $gt: new Date() }
  });

  if (activePayment) {
    return activePayment;
  }

  // 4. Generate Session
  const reference = generatePaymentReference();
  const upiUri = generateUpiUri(settings.upiId, settings.upiMerchantName || 'Satguru Electronics', amountToPay, reference);

  const payment = new Payment({
    reference,
    amount: amountToPay,
    method: paymentMethod,
    upiUri,
    merchantName: settings.upiMerchantName || 'Satguru Electronics',
    upiId: settings.upiId,
    status: 'CREATED',
    cartHash,
    cartSnapshot: { snapshotItems, calculatedSubtotal, shippingPrice, taxPrice, discountPrice, finalPayable, requiredAdvance },
    user: user || undefined,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry
  });

  await payment.save();

  return payment;
};

export const validatePaymentSubmission = async (paymentId, transactionId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment Session not found');

  if (payment.status !== 'CREATED' && payment.status !== 'PENDING_USER') {
    throw new Error('Payment Session is no longer active');
  }

  if (new Date() > payment.expiresAt) {
    throw new Error('Payment Session has expired');
  }

  // Check unique transaction ID
  if (transactionId) {
    const existingTx = await Payment.findOne({ transactionId });
    if (existingTx && existingTx._id.toString() !== payment._id.toString()) {
      throw new Error('This Transaction ID has already been submitted');
    }
    payment.transactionId = transactionId;
  }

  payment.status = 'UNDER_VERIFICATION';
  await payment.save();

  return payment;
};

export const verifyPayment = async (paymentId, adminId, action, notes) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');

  const allowedActions = ['Approve', 'Reject', 'Refund Required', 'Duplicate Payment', 'Wrong Amount', 'Expired'];
  if (!allowedActions.includes(action)) throw new Error('Invalid action');

  payment.verifiedBy = adminId;
  payment.verifiedAt = new Date();
  payment.notes = notes || action;

  if (action === 'Approve') {
    payment.status = 'VERIFIED';
    // Update associated order
    const Order = (await import('../models/Order.js')).default;
    const order = await Order.findOne({ payment: payment._id });
    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      if (payment.method === 'upi') {
        order.status = 'Processing';
      }
      await order.save();
    }
  } else {
    payment.status = action === 'Expired' ? 'EXPIRED' : 'REJECTED';
    
    // Inventory is NO LONGER restored here because it was never deducted.
    
    const Order = (await import('../models/Order.js')).default;
    await Order.updateOne({ payment: payment._id }, { status: 'Cancelled', adminMessage: `Payment ${action}` });
  }

  await payment.save();
  return payment;
};
