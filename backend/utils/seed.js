// utils/seed.js - Seed MongoDB with initial categories, products, and admin user

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Seed categories
  const categories = await Category.insertMany([
    { name: 'Electronics', description: 'Gadgets, devices, and electronic accessories' },
    { name: 'Clothing', description: 'Fashion wear for men, women, and kids' },
    { name: 'Books', description: 'Fiction, non-fiction, and educational books' },
    { name: 'Home & Garden', description: 'Home decor, furniture, and garden supplies' },
    { name: 'Sports', description: 'Sports equipment, activewear, and accessories' },
  ]);
  console.log('✅ Categories seeded');

  const electronics = categories.find((c) => c.name === 'Electronics')._id;
  const clothing = categories.find((c) => c.name === 'Clothing')._id;
  const books = categories.find((c) => c.name === 'Books')._id;
  const homeGarden = categories.find((c) => c.name === 'Home & Garden')._id;
  const sports = categories.find((c) => c.name === 'Sports')._id;

  // Seed products
  await Product.insertMany([
    { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30hr battery life.', price: 79.99, stock: 50, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: electronics },
    { name: 'Laptop Stand', description: 'Adjustable aluminum laptop stand for ergonomic working.', price: 39.99, stock: 100, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', category: electronics },
    { name: 'Running Shoes', description: 'Lightweight and breathable running shoes for all terrains.', price: 89.99, stock: 75, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: sports },
    { name: 'Classic T-Shirt', description: '100% cotton unisex classic fit t-shirt.', price: 19.99, stock: 200, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', category: clothing },
    { name: 'JavaScript: The Good Parts', description: 'Essential JavaScript reference by Douglas Crockford.', price: 24.99, stock: 30, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', category: books },
    { name: 'Plant Pot Set', description: 'Set of 3 ceramic plant pots with drainage holes.', price: 34.99, stock: 60, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', category: homeGarden },
    { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor.', price: 149.99, stock: 40, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: electronics },
    { name: 'Yoga Mat', description: 'Non-slip eco-friendly yoga mat, 6mm thick.', price: 29.99, stock: 85, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', category: sports },
  ]);
  console.log('✅ Products seeded');

  // Seed admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  await User.create({ name: 'Admin User', email: 'admin@ecommerce.com', password: hashedPassword, role: 'admin' });
  console.log('✅ Admin user seeded (admin@ecommerce.com / Admin@123)');

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
