// controllers/adminController.js - Admin Dashboard Operations

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({ is_active: true });
    const totalOrders = await Order.countDocuments();
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const formattedOrders = recentOrders.map((o) => ({
      id: o._id,
      total_amount: o.total_amount,
      status: o.status,
      created_at: o.createdAt,
      user_name: o.user?.name,
    }));

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue },
      recentOrders: formattedOrders,
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

    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    res.json({
      success: true,
      users: users.map((u) => ({ ...u, id: u._id, created_at: u.createdAt })),
      pagination: { total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// ─── PUT /api/admin/users/:id/toggle ──────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.is_active = !user.is_active;
    await user.save();
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus };
