// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

// Admin
router.get('/admin/all', adminOnly, getAllOrders);
router.put('/admin/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
