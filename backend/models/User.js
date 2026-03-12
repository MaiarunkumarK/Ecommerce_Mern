const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    avatar: { type: String, default: null },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
