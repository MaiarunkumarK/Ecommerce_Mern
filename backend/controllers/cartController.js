// controllers/cartController.js - Shopping Cart Operations

const { pool } = require('../config/db');

// ─── GET /api/cart ─────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT c.id, c.quantity, c.product_id,
              p.name, p.price, p.image, p.stock, p.is_active,
              (c.quantity * p.price) AS subtotal
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.is_active = 1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({ success: true, cartItems, total: total.toFixed(2), itemCount: cartItems.length });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
};

// ─── POST /api/cart/add ────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    // Verify product exists and has enough stock
    const [products] = await pool.query(
      'SELECT id, stock, is_active FROM products WHERE id = ?',
      [product_id]
    );

    if (!products.length || !products[0].is_active) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = products[0];
    const qty = Math.max(1, parseInt(quantity));

    // Check if product is already in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length) {
      // Update quantity if already exists
      const newQty = existing[0].quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
      }
      await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      // Check stock
      if (qty > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
      }
      // Insert new cart item
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, qty]
      );
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

  if (!cart_id || quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Cart ID and quantity are required.' });
  }

  try {
    if (parseInt(quantity) <= 0) {
      // Remove item if quantity is 0
      await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cart_id, req.user.id]);
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    // Check stock
    const [cartRow] = await pool.query(
      'SELECT c.product_id FROM cart c WHERE c.id = ? AND c.user_id = ?',
      [cart_id, req.user.id]
    );
    if (!cartRow.length) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const [product] = await pool.query('SELECT stock FROM products WHERE id = ?', [cartRow[0].product_id]);
    if (parseInt(quantity) > product[0].stock) {
      return res.status(400).json({ success: false, message: `Only ${product[0].stock} items in stock.` });
    }

    await pool.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, cart_id, req.user.id]);
    res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
};

// ─── DELETE /api/cart/remove ───────────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  const { cart_id } = req.body;
  if (!cart_id) {
    return res.status(400).json({ success: false, message: 'Cart ID is required.' });
  }

  try {
    await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cart_id, req.user.id]);
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
};

// ─── DELETE /api/cart/clear ────────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
