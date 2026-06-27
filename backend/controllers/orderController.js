import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { calculateDiscount, calculateShipping, calculateTax, calculateAdvance, calculateGrandTotal } from '../utils/pricing.js';

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (guest checkout)
export const createOrder = async (req, res) => {
  // Try to use a transaction if replica sets are available
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    // Fallback if not using replica set
    session = null; 
  }

  try {
    const { 
      name, email, phone, shippingAddress, 
      orderItems, paymentMethod, advancePaid, 
      upiTransactionId, user, idempotencyKey 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: 'No order items' });
    }

    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        if (session) await session.abortTransaction();
        return res.status(200).json(existingOrder);
      }
    }

    // 2. Fetch Settings & Validate
    const settings = await Settings.getSettings();
    
    // Check if payment method is enabled
    const pmConfig = settings.paymentMethods?.find(pm => pm.id === paymentMethod);
    if (!pmConfig || !pmConfig.enabled) {
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: `Payment method ${paymentMethod} is not enabled or invalid.` });
    }

    // 3. Fetch Products & Generate Snapshot
    const snapshotItems = [];
    let calculatedSubtotal = 0;

    for (const item of orderItems) {
      if (item.qty <= 0) {
        if (session) await session.abortTransaction();
        return res.status(400).json({ message: `Invalid quantity for item ${item.name}` });
      }

      // Atomically check stock, visibility, and reserve the stock
      const product = await Product.findOneAndUpdate(
        { 
          _id: item.product, 
          isVisible: true,
          countInStock: { $gte: item.qty } 
        },
        { 
          $inc: { countInStock: -item.qty, reservedStock: item.qty } 
        },
        { new: true, session }
      );

      if (!product) {
        // If no session is active (fallback mode), we must manually rollback previous reservations
        if (!session) {
          for (const rollbackItem of snapshotItems) {
            await Product.updateOne(
              { _id: rollbackItem.product },
              { $inc: { countInStock: rollbackItem.qty, reservedStock: -rollbackItem.qty } }
            );
          }
        } else {
          await session.abortTransaction();
        }
        return res.status(400).json({ message: `Insufficient stock or product unavailable for ${item.name}` });
      }

      // Auto-set availability if stock just hit 0
      if (product.countInStock === 0) {
        product.availability = 'Out of Stock';
        await product.save({ session });
      }

      // Calculate total for this item
      calculatedSubtotal += (product.sellingPrice || product.price) * item.qty;

      // Create immutable snapshot
      snapshotItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        brand: product.brand?.name || product.brand || '', // Handle populated vs unpopulated brand if applicable
        category: product.category?.name || product.category || '', 
        childCategory: product.childCategory || '',
        subCategory: product.subCategory || '',
        sku: product.sku || '',
        mainImage: product.mainImage || (product.images && product.images[0]) || '',
        mrp: product.mrp || 0,
        sellingPrice: product.sellingPrice || product.price || 0,
        discount: product.discountPercentage || 0,
        priceAtPurchase: product.sellingPrice || product.price || 0,
        qty: item.qty
      });
    }

    // 4. Calculate Final Prices
    const discountPrice = calculateDiscount();
    const shippingPrice = calculateShipping(settings, calculatedSubtotal);
    const taxPrice = calculateTax(settings, calculatedSubtotal);
    const finalPayable = calculateGrandTotal(calculatedSubtotal, shippingPrice, taxPrice, discountPrice);
    
    // Validate advance amount if applicable
    const requiredAdvance = calculateAdvance(settings, paymentMethod, calculatedSubtotal);

    if ((requiredAdvance > 0 || paymentMethod === 'upi') && !upiTransactionId) {
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: 'Please provide a valid Transaction ID for your payment.' });
    }

    // 5. Create Order
    const order = new Order({
      user: user || undefined,
      name, email, phone, shippingAddress,
      orderItems: snapshotItems,
      itemsPrice: calculatedSubtotal, // This is Subtotal
      shippingPrice,
      taxPrice,
      discountPrice,
      totalPrice: calculatedSubtotal, // Legacy support
      finalPayable,
      paymentMethod,
      isPaid: paymentMethod === 'upi' || paymentMethod === 'razorpay',
      advancePaid: advancePaid || false,
      advanceAmount: requiredAdvance,
      upiTransactionId: upiTransactionId || '',
      status: 'Pending',
      idempotencyKey
    });

    const createdOrder = await order.save({ session });

    // Stock will only be deducted when the Admin approves the order (changes status from Pending)

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }
    
    res.status(201).json(createdOrder);
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null;
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    const newStatus = req.body.status || order.status;

    order.status = newStatus;
    if (req.body.adminMessage !== undefined) {
      order.adminMessage = req.body.adminMessage;
    }
    if (newStatus === 'Delivered') order.isDelivered = true;

    const isOldPending = oldStatus === 'Pending';
    const isOldApproved = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(oldStatus);
    const isOldCancelled = oldStatus === 'Cancelled';

    const isNewPending = newStatus === 'Pending';
    const isNewApproved = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(newStatus);
    const isNewCancelled = newStatus === 'Cancelled';

    // Build bulk updates for products based on state transitions
    const bulkOps = [];

    if (oldStatus !== newStatus) {
      for (const item of order.orderItems) {
        let countInc = 0;
        let reserveInc = 0;

        if (isOldPending && isNewApproved) { reserveInc -= item.qty; }
        else if (isOldPending && isNewCancelled) { countInc += item.qty; reserveInc -= item.qty; }
        else if (isOldApproved && isNewCancelled) { countInc += item.qty; }
        else if (isOldCancelled && isNewPending) { countInc -= item.qty; reserveInc += item.qty; }
        else if (isOldCancelled && isNewApproved) { countInc -= item.qty; }
        else if (isOldApproved && isNewPending) { reserveInc += item.qty; }

        if (countInc !== 0 || reserveInc !== 0) {
          bulkOps.push({
            updateOne: {
              filter: { _id: item.product },
              update: { 
                $inc: { countInStock: countInc, reservedStock: reserveInc }
              }
            }
          });
        }
      }

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps, { session });
        
        // Auto-update availability for affected products (can't easily do in bulkWrite without aggregation)
        // so we run a background check or a simple updateMany
        await Product.updateMany(
          { _id: { $in: order.orderItems.map(i => i.product) }, countInStock: { $lte: 0 } },
          { $set: { availability: 'Out of Stock' } },
          { session }
        );
        await Product.updateMany(
          { _id: { $in: order.orderItems.map(i => i.product) }, countInStock: { $gt: 0 } },
          { $set: { availability: 'In Stock' } },
          { session }
        );
      }
    }

    const updated = await order.save({ session });
    
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    res.json(updated);
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all orders
// @route   DELETE /api/orders
// @access  Admin
export const clearAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'All orders have been cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a specific order
// @route   DELETE /api/orders/:id
// @access  Admin
export const deleteOrderById = async (req, res) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null;
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const isPending = order.status === 'Pending';
    const isApproved = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(order.status);
    
    // If order was Pending, restore reserved stock. 
    // If order was Approved, restore sold stock.
    // If order was Cancelled, stock was already restored during cancellation.
    if (isPending || isApproved) {
      const bulkOps = [];
      for (const item of order.orderItems) {
        let countInc = 0;
        let reserveInc = 0;
        
        if (isPending) {
          countInc += item.qty;
          reserveInc -= item.qty;
        } else if (isApproved) {
          countInc += item.qty;
        }

        if (countInc !== 0 || reserveInc !== 0) {
          bulkOps.push({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { countInStock: countInc, reservedStock: reserveInc } }
            }
          });
        }
      }

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps, { session });
        await Product.updateMany(
          { _id: { $in: order.orderItems.map(i => i.product) }, countInStock: { $gt: 0 } },
          { $set: { availability: 'In Stock' } },
          { session }
        );
      }
    }
    await order.deleteOne({ session });
    
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    res.json({ message: 'Order removed and stock restored if applicable' });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: error.message });
  }
};
