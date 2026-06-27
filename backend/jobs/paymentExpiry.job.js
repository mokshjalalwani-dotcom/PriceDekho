import cron from 'node-cron';
import Payment from '../models/Payment.js';
import logger from '../utils/logger.js';

// Run every minute
export const initPaymentExpiryJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredPayments = await Payment.find({
        status: { $in: ['CREATED', 'PENDING_USER'] },
        expiresAt: { $lt: new Date() }
      });

      for (const payment of expiredPayments) {
        try {
          payment.status = 'EXPIRED';
          payment.notes = 'System: Automatically expired session.';
          await payment.save();

          logger.info(`Expired payment session: ${payment._id}`);
        } catch (error) {
          logger.error(`Failed to process expiry for payment ${payment._id}: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error(`Error in payment expiry cron: ${error.message}`);
    }
  });
};
