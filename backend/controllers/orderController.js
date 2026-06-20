import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (guest checkout)
export const createOrder = async (req, res) => {
  try {
    const { name, email, phone, shippingAddress, orderItems, itemsPrice, shippingPrice, totalPrice, paymentMethod, advancePaid, advanceAmount, upiTransactionId, user } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: user || undefined,
      name, email, phone, shippingAddress,
      orderItems, itemsPrice, shippingPrice, totalPrice,
      paymentMethod: paymentMethod || 'COD',
      advancePaid: advancePaid || false,
      advanceAmount: advanceAmount || 0,
      upiTransactionId: upiTransactionId || '',
      isPaid: paymentMethod === 'UPI',
    });

    const createdOrder = await order.save();

    // Reduce stock for each ordered item
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        if (product.countInStock < 0) product.countInStock = 0;
        product.availability = product.countInStock > 0 ? 'In Stock' : 'Out of Stock';
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
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
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status || order.status;
    if (req.body.adminMessage !== undefined) {
      order.adminMessage = req.body.adminMessage;
    }
    if (req.body.status === 'Delivered') order.isDelivered = true;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
