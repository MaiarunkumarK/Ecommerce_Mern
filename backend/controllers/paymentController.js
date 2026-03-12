// controllers/paymentController.js - Stripe Payment Integration

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../config/db');

// ─── POST /api/payment/create-checkout-session ─────────────────────────────────
const createCheckoutSession = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required.' });
  }

  try {
    // Fetch the order (must belong to the requesting user)
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    );

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Fetch order items for Stripe line items
    const [items] = await pool.query(
      `SELECT oi.quantity, oi.price, p.name, p.image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // Build Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.image && item.image.startsWith('http') ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
      metadata: {
        order_id: orderId.toString(),
        user_id: req.user.id.toString(),
      },
      customer_email: req.user.email,
    });

    // Save pending payment record
    await pool.query(
      `INSERT INTO payments (order_id, stripe_session_id, amount, status)
       VALUES (?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE stripe_session_id = ?, status = 'pending'`,
      [orderId, session.id, order.total_amount, session.id]
    );

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment session.' });
  }
};

// ─── POST /api/payment/webhook ─────────────────────────────────────────────────
// Stripe sends events here; must be registered in Stripe Dashboard
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;

    try {
      // Mark payment as completed
      await pool.query(
        `UPDATE payments
         SET status = 'completed', stripe_payment_intent = ?
         WHERE stripe_session_id = ?`,
        [session.payment_intent, session.id]
      );
      // Update order status
      await pool.query("UPDATE orders SET status = 'processing' WHERE id = ?", [orderId]);
      console.log(`✅ Payment completed for order #${orderId}`);
    } catch (err) {
      console.error('Webhook DB error:', err);
    }
  }

  res.json({ received: true });
};

// ─── GET /api/payment/verify/:sessionId ───────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status === 'paid') {
      const orderId = session.metadata.order_id;

      // Update payment and order status
      await pool.query(
        "UPDATE payments SET status = 'completed', stripe_payment_intent = ? WHERE stripe_session_id = ?",
        [session.payment_intent, session.id]
      );
      await pool.query("UPDATE orders SET status = 'processing' WHERE id = ? AND status = 'pending'", [orderId]);

      return res.json({ success: true, paid: true, orderId });
    }

    res.json({ success: true, paid: false });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
};

module.exports = { createCheckoutSession, stripeWebhook, verifyPayment };
