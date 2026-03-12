// controllers/orderController.js - Order Management

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─── POST /api/orders ──────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { shipping, notes } = req.body;
  if (!shipping || !shipping.name || !shipping.address)
    return res.status(400).json({ success: false, message: 'Shipping details are required.' });

  try {
    const cartItems = await Cart.find({ user: req.user._id }).populate({ path: 'product', match: { is_active: true } });
    const validItems = cartItems.filter((item) => item.product);
    if (!validItems.length) return res.status(400).json({ success: false, message: 'Your cart is empty.' });

    for (const item of validItems) {
      if (item.quantity > item.product.stock)
        return res.status(400).json({ success: false, message: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}` });
    }

    const total = validItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const order = await Order.create({
      user: req.user._id,
      items: validItems.map((item) => ({ product: item.product._id, name: item.product.name, image: item.product.image, quantity: item.quantity, price: item.product.price })),
      total_amount: parseFloat(total.toFixed(2)),
      shipping_name: shipping.name, shipping_email: shipping.email, shipping_phone: shipping.phone,
      shipping_address: shipping.address, shipping_city: shipping.city, shipping_state: shipping.state,
      shipping_zip: shipping.zip, shipping_country: shipping.country, notes: notes || null,
    });

    for (const item of validItems) await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    await Cart.deleteMany({ user: req.user._id });

    res.status(201).json({ success: true, message: 'Order placed successfully.', orderId: order._id });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
};

// ─── GET /api/orders (User's own orders) ──────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders: orders.map((o) => ({ ...o, id: o._id, item_count: o.items.length })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ─── GET /api/orders/:id ───────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ order: req.params.id }).lean();
    res.json({ success: true, order: { ...order, id: order._id, payment: payment || null } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

// ─── GET /api/admin/orders (Admin) ────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean();
    const result = orders.map((o) => ({ ...o, id: o._id, user_name: o.user?.name, user_email: o.user?.email, item_count: o.items.length }));

    res.json({ success: true, orders: result, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ─── PUT /api/admin/orders/:id/status (Admin) ─────────────────────────────────
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
  try {
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: 'Order status updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
