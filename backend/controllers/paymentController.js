// controllers/paymentController.js - Stripe Payment Integration

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// ─── POST /api/payment/create-checkout-session ─────────────────────────────────
const createCheckoutSession = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required.' });
  }

  try {
    // Fetch the order (must belong to the requesting user)
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Build Stripe line items
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.image && item.image.startsWith('http') ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
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
        user_id: req.user._id.toString(),
      },
      customer_email: req.user.email,
    });

    // Save pending payment record
    await Payment.findOneAndUpdate(
      { order: orderId },
      { order: orderId, stripe_session_id: session.id, amount: order.total_amount, status: 'pending' },
      { upsert: true, new: true }
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

    try {
      // Mark payment as completed
      await Payment.findOneAndUpdate(
        { stripe_session_id: session.id },
        { status: 'completed', stripe_payment_intent: session.payment_intent }
      );
      // Update order status
      await Order.findByIdAndUpdate(session.metadata.order_id, { status: 'processing' });
      console.log(`✅ Payment completed for order #${session.metadata.order_id}`);
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
      await Payment.findOneAndUpdate({ stripe_session_id: session.id }, { status: 'completed', stripe_payment_intent: session.payment_intent });
      await Order.findOneAndUpdate({ _id: orderId, status: 'pending' }, { status: 'processing' });

      return res.json({ success: true, paid: true, orderId });
    }

    res.json({ success: true, paid: false });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
};

module.exports = { createCheckoutSession, stripeWebhook, verifyPayment };
