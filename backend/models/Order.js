const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total_amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shipping_name: String,
    shipping_email: String,
    shipping_phone: String,
    shipping_address: String,
    shipping_city: String,
    shipping_state: String,
    shipping_zip: String,
    shipping_country: String,
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
