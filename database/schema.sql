-- ============================================================
-- E-Commerce Application - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce;

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,         -- bcrypt hashed
  role ENUM('user', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  address TEXT,
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(500),
  category_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- CART TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_name VARCHAR(150),
  shipping_email VARCHAR(200),
  shipping_phone VARCHAR(20),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_zip VARCHAR(20),
  shipping_country VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ORDER_ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,  -- price at time of purchase
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  stripe_session_id VARCHAR(300) NOT NULL,
  stripe_payment_intent VARCHAR(300),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA - Categories
-- ============================================================
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Gadgets, devices, and electronic accessories'),
  ('Clothing', 'Fashion wear for men, women, and kids'),
  ('Books', 'Fiction, non-fiction, and educational books'),
  ('Home & Garden', 'Home decor, furniture, and garden supplies'),
  ('Sports', 'Sports equipment, activewear, and accessories');

-- ============================================================
-- SEED DATA - Admin User (password: Admin@123)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@ecommerce.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J6/cMhU6K', 'admin');

-- ============================================================
-- SEED DATA - Sample Products
-- ============================================================
INSERT INTO products (name, description, price, stock, image, category_id) VALUES
  ('Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30hr battery life.', 79.99, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1),
  ('Laptop Stand', 'Adjustable aluminum laptop stand for ergonomic working.', 39.99, 100, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 1),
  ('Running Shoes', 'Lightweight and breathable running shoes for all terrains.', 89.99, 75, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 5),
  ('Classic T-Shirt', '100% cotton unisex classic fit t-shirt.', 19.99, 200, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 2),
  ('JavaScript: The Good Parts', 'Essential JavaScript reference by Douglas Crockford.', 24.99, 30, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 3),
  ('Plant Pot Set', 'Set of 3 ceramic plant pots with drainage holes.', 34.99, 60, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', 4),
  ('Smart Watch', 'Fitness tracking smartwatch with heart rate monitor.', 149.99, 40, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1),
  ('Yoga Mat', 'Non-slip eco-friendly yoga mat, 6mm thick.', 29.99, 85, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 5);
