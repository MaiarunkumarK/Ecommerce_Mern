const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    stripe_session_id: { type: String, required: true },
    stripe_payment_intent: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
