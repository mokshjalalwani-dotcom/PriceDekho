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

      const product = await Product.findById(item.product);
      if (!product) {
        if (session) await session.abortTransaction();
        return res.status(400).json({ message: `Product ${item.name} not found or deleted.` });
      }
      
      // Validate visibility (assuming 'isVisible' or 'availability' is used)
      if (product.isVisible === false) {
        if (session) await session.abortTransaction();
        return res.status(400).json({ message: `Product ${product.name} is not available for purchase.` });
      }

      // Validate stock
      if (product.countInStock < item.qty) {
        if (session) await session.abortTransaction();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
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
    
    // Deduct stock: Moving from Pending/Cancelled to Approved
    const wasUnapproved = oldStatus === 'Pending' || oldStatus === 'Cancelled';
    const isApproved = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(newStatus);
    
    if (wasUnapproved && isApproved) {
      for (const item of order.orderItems) {
        const p = await Product.findById(item.product);
        if (p) {
          p.countInStock -= item.qty;
          if (p.countInStock < 0) p.countInStock = 0;
          p.availability = p.countInStock > 0 ? 'In Stock' : 'Out of Stock';
          await p.save({ session });
        }
      }
    }

    // Restore stock: Moving from Approved to Cancelled
    const wasApproved = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(oldStatus);
    const isCancelled = newStatus === 'Cancelled' || newStatus === 'Pending';

    if (wasApproved && isCancelled) {
      for (const item of order.orderItems) {
        const p = await Product.findById(item.product);
        if (p) {
          p.countInStock += item.qty;
          p.availability = 'In Stock';
          await p.save({ session });
        }
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
    
    // If order was in a confirmed state, restore the stock before deleting
    if (['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(order.status)) {
      for (const item of order.orderItems) {
        const p = await Product.findById(item.product);
        if (p) {
          p.countInStock += item.qty;
          p.availability = 'In Stock';
          await p.save({ session });
        }
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
