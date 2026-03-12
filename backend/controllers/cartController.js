// controllers/cartController.js - Shopping Cart Operations

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─── GET /api/cart ─────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user._id })
      .populate({ path: 'product', match: { is_active: true }, select: 'name price image stock is_active' })
      .sort({ createdAt: -1 }).lean();

    const validItems = cartItems.filter((item) => item.product).map((item) => ({
      id: item._id, cart_id: item._id, product_id: item.product._id,
      name: item.product.name, price: item.product.price, image: item.product.image,
      stock: item.product.stock, quantity: item.quantity,
      subtotal: (item.quantity * item.product.price).toFixed(2),
    }));

    const total = validItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    res.json({ success: true, cartItems: validItems, total: total.toFixed(2), itemCount: validItems.length });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
};

// ─── POST /api/cart/add ────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ success: false, message: 'Product ID is required.' });

  try {
    const product = await Product.findOne({ _id: product_id, is_active: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const qty = Math.max(1, parseInt(quantity));
    const existing = await Cart.findOne({ user: req.user._id, product: product_id });

    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
      existing.quantity = newQty;
      await existing.save();
    } else {
      if (qty > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
      await Cart.create({ user: req.user._id, product: product_id, quantity: qty });
    }
    res.json({ success: true, message: 'Item added to cart.' });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
};

// ─── PUT /api/cart/update ─────────────────────────────────────────────────────
const updateCartItem = async (req, res) => {
  const { cart_id, quantity } = req.body;
  if (!cart_id || quantity === undefined) return res.status(400).json({ success: false, message: 'Cart ID and quantity are required.' });

  try {
    if (parseInt(quantity) <= 0) {
      await Cart.findOneAndDelete({ _id: cart_id, user: req.user._id });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }
    const cartItem = await Cart.findOne({ _id: cart_id, user: req.user._id }).populate('product', 'stock');
    if (!cartItem) return res.status(404).json({ success: false, message: 'Cart item not found.' });
    if (parseInt(quantity) > cartItem.product.stock) return res.status(400).json({ success: false, message: `Only ${cartItem.product.stock} items in stock.` });

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();
    res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
};

// ─── DELETE /api/cart/remove ───────────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  const { cart_id } = req.body;
  if (!cart_id) return res.status(400).json({ success: false, message: 'Cart ID is required.' });
  try {
    await Cart.findOneAndDelete({ _id: cart_id, user: req.user._id });
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
};

// ─── DELETE /api/cart/clear ────────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
