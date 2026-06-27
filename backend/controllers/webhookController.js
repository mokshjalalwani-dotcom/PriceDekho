import crypto from 'crypto';
import Order from '../models/Order.js';

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

      try {
        // 1. Idempotency Check
        const order = await Order.findById(orderId);
        if (!order || order.status !== 'Pending') {
          return res.status(200).json({ status: 'ok', message: 'Order already processed or not found' });
        }

        // 2. State transition (Pending -> Confirmed)
        order.status = 'Confirmed';
        order.isPaid = true;
        order.paymentMethod = 'razorpay';
        
        await order.save();
        return res.status(200).json({ status: 'ok' });
      } catch (err) {
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
