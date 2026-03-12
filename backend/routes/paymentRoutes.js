// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createCheckoutSession, stripeWebhook, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe webhook - needs raw body, no auth
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.use(protect);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/verify/:sessionId', verifyPayment);

module.exports = router;
