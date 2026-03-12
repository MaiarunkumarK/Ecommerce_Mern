// controllers/orderController.js - Order Management

const { pool } = require('../config/db');

// ─── POST /api/orders ──────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { shipping, notes } = req.body;

  if (!shipping || !shipping.name || !shipping.address) {
    return res.status(400).json({ success: false, message: 'Shipping details are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch cart items for this user
    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.price, p.name, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.is_active = 1`,
      [req.user.id]
    );

    if (!cartItems.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Verify stock for all items
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.name}". Available: ${item.stock}`,
        });
      }
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0);

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (user_id, total_amount, shipping_name, shipping_email, shipping_phone,
        shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        total.toFixed(2),
        shipping.name,
        shipping.email,
        shipping.phone,
        shipping.address,
        shipping.city,
        shipping.state,
        shipping.zip,
        shipping.country,
        notes || null,
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items and reduce stock
    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      // Reduce product stock
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
        item.quantity,
        item.product_id,
      ]);
    }

    // Clear user's cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    res.status(201).json({ success: true, message: 'Order placed successfully.', orderId });
  } catch (error) {
    await connection.rollback();
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  } finally {
    connection.release();
  }
};

// ─── GET /api/orders (User's own orders) ──────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, 
              COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ─── GET /api/orders/:id ───────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    const [payment] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [req.params.id]);

    res.json({ success: true, order: { ...orders[0], items, payment: payment[0] || null } });
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
    const offset = (pageNum - 1) * limitNum;

    let where = '';
    const params = [];
    if (status) {
      where = 'WHERE o.status = ?';
      params.push(status);
    }

    const [orders] = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email,
              COUNT(oi.id) AS item_count
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       ${where}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM orders o ${where}`, params);

    res.json({ success: true, orders, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ─── PUT /api/admin/orders/:id/status (Admin) ─────────────────────────────────
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Order status updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
