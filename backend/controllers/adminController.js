// controllers/adminController.js - Admin Dashboard Operations

const { pool } = require('../config/db');

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE role = "user"');
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products WHERE is_active = 1');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM payments WHERE status = 'completed'"
    );

    // Recent orders
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS user_name
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue: parseFloat(totalRevenue) },
      recentOrders,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const [users] = await pool.query(
      `SELECT id, name, email, role, phone, is_active, created_at
       FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limitNum, offset]
    );

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM users');

    res.json({ success: true, users, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// ─── PUT /api/admin/users/:id/toggle ──────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const [user] = await pool.query('SELECT is_active FROM users WHERE id = ?', [req.params.id]);
    if (!user.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [!user[0].is_active, req.params.id]);
    res.json({ success: true, message: `User ${user[0].is_active ? 'deactivated' : 'activated'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus };
