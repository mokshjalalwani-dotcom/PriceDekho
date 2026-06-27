import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Run every 5 minutes
export const initReservationExpiryJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running automatic reservation expiry check...');
    
    // Find orders that are Pending and older than 30 minutes
    const expiryTime = new Date(Date.now() - 30 * 60 * 1000);
    
    try {
      const expiredOrders = await Order.find({
        status: 'Pending',
        createdAt: { $lt: expiryTime }
      });

      for (const order of expiredOrders) {
        let session = null;
        try {
          session = await mongoose.startSession();
          session.startTransaction();
        } catch (err) {
          session = null;
        }

        try {
          // Restore reserved stock to available stock
          const bulkOps = [];
          for (const item of order.orderItems) {
            bulkOps.push({
              updateOne: {
                filter: { _id: item.product },
                update: { $inc: { countInStock: item.qty, reservedStock: -item.qty } }
              }
            });
          }

          if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps, { session });
            
            // Auto-update availability for affected products
            await Product.updateMany(
              { _id: { $in: order.orderItems.map(i => i.product) }, countInStock: { $gt: 0 } },
              { $set: { availability: 'In Stock' } },
              { session }
            );
          }

          // Mark order as Cancelled due to payment timeout
          order.status = 'Cancelled';
          order.adminMessage = 'System: Automatically cancelled due to payment timeout (reservation expired).';
          await order.save({ session });

          if (session) {
            await session.commitTransaction();
            session.endSession();
          }
          console.log(Expired and restored stock for order: ${order._id});
        } catch (error) {
          console.error(Failed to process expiry for order ${order._id}:, error);
          if (session) {
            await session.abortTransaction();
            session.endSession();
          }
        }
      }
    } catch (error) {
      console.error('Reservation expiry job failed:', error);
    }
  });
};
