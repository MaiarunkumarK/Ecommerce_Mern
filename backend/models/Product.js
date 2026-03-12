const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
