import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'secret';
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      return res.status(400).json({ status: 'error', message: 'Invalid signature' });
    }

    // Process payment.captured event
    if (req.body.event === 'payment.captured' || req.body.event === 'order.paid') {
      const payment = req.body.payload.payment.entity;
      const orderId = payment.notes?.orderId;
      
      if (!orderId) return res.status(200).json({ status: 'ok' });

      let session = null;
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch (err) {
        session = null;
      }

      try {
        // 1. Idempotency Check
        const order = await Order.findById(orderId);
        if (!order || order.status !== 'Pending') {
          if (session) await session.abortTransaction();
          return res.status(200).json({ status: 'ok', message: 'Order already processed or not found' });
        }

        // 2. State transition (Pending -> Confirmed)
        order.status = 'Confirmed';
        order.isPaid = true;
        order.paymentMethod = 'razorpay';
        
        // 3. Atomically convert reserved stock to sold stock
        const bulkOps = [];
        for (const item of order.orderItems) {
          bulkOps.push({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { reservedStock: -item.qty } } // countInStock was already deducted at checkout
            }
          });
        }

        if (bulkOps.length > 0) {
          await Product.bulkWrite(bulkOps, { session });
        }

        await order.save({ session });

        if (session) {
          await session.commitTransaction();
          session.endSession();
        }
        return res.status(200).json({ status: 'ok' });
      } catch (err) {
        if (session) await session.abortTransaction();
        console.error('Webhook processing error:', err);
        return res.status(500).json({ status: 'error', message: err.message });
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ status: 'error' });
  }
};
