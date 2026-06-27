import { getOrCreatePaymentSession, validatePaymentSubmission, verifyPayment } from '../services/paymentService.js';
import Payment from '../models/Payment.js';
import logger from '../utils/logger.js';
import { generateQrCode } from '../services/upiService.js';

export const createSession = async (req, res) => {
  try {
    const payment = await getOrCreatePaymentSession(req.body, req.user ? req.user._id : null);
    res.status(201).json(payment);
  } catch (err) {
    logger.error(`Create Payment Session Error: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Session not found' });
    
    let qrCode = null;
    if (payment.upiUri) {
      qrCode = await generateQrCode(payment.upiUri);
    }
    
    res.json({ ...payment.toObject(), qrCode });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitSession = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const payment = await validatePaymentSubmission(req.params.id, transactionId);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 20;
    const count = await Payment.countDocuments({});
    const payments = await Payment.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    
    res.json({ payments, page, pages: Math.ceil(count / pageSize) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const adminVerifyPayment = async (req, res) => {
  try {
    const { action, notes } = req.body;
    const payment = await verifyPayment(req.params.id, req.user._id, action, notes);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAdminPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment verification record deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
