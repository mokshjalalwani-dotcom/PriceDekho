import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { calculateDiscount, calculateShipping, calculateTax, calculateAdvance, calculateGrandTotal } from '../utils/pricing.js';

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (guest checkout)
export const createOrder = async (req, res) => {
  try {
    const { 
      name, email, phone, shippingAddress, 
      orderItems, paymentMethod, advancePaid, 
      upiTransactionId, paymentSessionId, user, idempotencyKey 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        return res.status(200).json(existingOrder);
      }
    }

    const settings = await Settings.getSettings();

    const isAllowed = 
      (paymentMethod === 'cod' && settings.isCodEnabled) ||
      (paymentMethod === 'upi' && settings.isUpiEnabled) ||
      (paymentMethod === 'razorpay' && settings.isRazorpayEnabled);
      
    if (!isAllowed) {
      return res.status(400).json({ message: `Payment method ${paymentMethod} is not enabled or invalid.` });
    }

    let snapshotItems = [];
    let calculatedSubtotal = 0;
    let shippingPrice, taxPrice, discountPrice, finalPayable, requiredAdvance;

    if (paymentSessionId) {
      const { validatePaymentSubmission } = await import('../services/paymentService.js');
      const payment = await validatePaymentSubmission(paymentSessionId, upiTransactionId);
      
      const snap = payment.cartSnapshot;
      snapshotItems = snap.snapshotItems;
      calculatedSubtotal = snap.calculatedSubtotal;
      shippingPrice = snap.shippingPrice;
      taxPrice = snap.taxPrice;
      discountPrice = snap.discountPrice;
      finalPayable = snap.finalPayable;
      requiredAdvance = snap.requiredAdvance;

    } else {
      // Pure COD flow (No payment session required)
      for (const item of orderItems) {
        if (item.qty <= 0) throw new Error(`Invalid quantity for item ${item.name}`);
        if (settings.maxOrderQuantity && item.qty > settings.maxOrderQuantity) {
          throw new Error(`Quantity exceeds max limit of ${settings.maxOrderQuantity} for item ${item.name}`);
        }

        const product = await Product.findOne({ _id: item.product, isVisible: true });

        if (!product) {
          return res.status(400).json({ message: `Product unavailable or inactive for ${item.name}` });
        }

        calculatedSubtotal += (product.sellingPrice || product.price) * item.qty;

        snapshotItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          brand: product.brand?.name || product.brand || '',
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

      discountPrice = calculateDiscount();
      shippingPrice = calculateShipping(settings, calculatedSubtotal);
      taxPrice = calculateTax(settings, calculatedSubtotal);
      finalPayable = calculateGrandTotal(calculatedSubtotal, shippingPrice, taxPrice, discountPrice);
      requiredAdvance = calculateAdvance(settings, paymentMethod, calculatedSubtotal);

      if (requiredAdvance > 0) {
         return res.status(400).json({ message: 'Advance payment required. Please use the UPI flow.' });
      }
    }

    const order = new Order({
      user: user || undefined,
      name, email, phone, shippingAddress,
      orderItems: snapshotItems,
      itemsPrice: calculatedSubtotal,
      shippingPrice,
      taxPrice,
      discountPrice,
      totalPrice: calculatedSubtotal,
      finalPayable,
      paymentMethod,
      isPaid: false, // Will be marked paid when admin verifies
      advancePaid: advancePaid || false,
      advanceAmount: requiredAdvance,
      payment: paymentSessionId || undefined,
      status: 'Pending',
      idempotencyKey
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const totalOrders = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders
    });
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
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    const newStatus = req.body.status || order.status;

    order.status = newStatus;
    if (req.body.adminMessage !== undefined) {
      order.adminMessage = req.body.adminMessage;
    }
    if (newStatus === 'Delivered') order.isDelivered = true;

    // FULFILLMENT LOGIC
    // We only deduct stock when order is Shipped or Delivered.
    const fulfilledStatuses = ['Shipped', 'Delivered'];
    const isOldFulfilled = fulfilledStatuses.includes(oldStatus);
    const isNewFulfilled = fulfilledStatuses.includes(newStatus);

    const bulkOps = [];

    if (oldStatus !== newStatus) {
      for (const item of order.orderItems) {
        let countInc = 0;

        // Moving to fulfilled state: deduct stock
        if (!isOldFulfilled && isNewFulfilled) {
          countInc -= item.qty;
        } 
        // Reverting from fulfilled state: restore stock
        else if (isOldFulfilled && !isNewFulfilled) {
          countInc += item.qty;
        }

        if (countInc !== 0) {
          bulkOps.push({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { countInStock: countInc } }
            }
          });
        }
      }

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
        
        await Product.updateMany(
          { _id: { $in: order.orderItems.map(i => i.product) }, countInStock: { $lte: 0 } },
          { $set: { availability: 'Out of Stock' } }
        );
        await Product.updateMany(
          { _id: { $in: order.orderItems.map(i => i.product) }, countInStock: { $gt: 0 } },
          { $set: { availability: 'In Stock' } }
        );
      }
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
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
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If order was fulfilled, restore sold stock.
    const isFulfilled = ['Shipped', 'Delivered'].includes(order.status);
    
    if (isFulfilled) {
      const bulkOps = [];
      for (const item of order.orderItems) {
        bulkOps.push({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { countInStock: item.qty } }
          }
        });
      }

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
        await Product.updateMany(
          { _id: { $in: order.orderItems.map(i => i.product) }, countInStock: { $gt: 0 } },
          { $set: { availability: 'In Stock' } }
        );
      }
    }

    await order.deleteOne();
    res.json({ message: 'Order removed and stock restored if applicable' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
