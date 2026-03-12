// controllers/productController.js - Product CRUD Operations

const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// ─── GET /api/products ─────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12, sort = 'id', order = 'DESC' } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Whitelist sort columns to prevent SQL injection
    const sortColumns = ['id', 'name', 'price', 'stock', 'created_at'];
    const safeSort = sortColumns.includes(sort) ? sort : 'id';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereConditions = ['p.is_active = 1'];
    const queryParams = [];

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      whereConditions.push('c.name = ?');
      queryParams.push(category);
    }

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matching products for pagination
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, queryParams);
    const total = countRows[0].total;

    // Fetch paginated products
    const productSql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;
    const [products] = await pool.query(productSql, [...queryParams, limitNum, offset]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// ─── GET /api/products/:id ─────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? AND p.is_active = 1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// ─── POST /api/products (Admin) ───────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock, image, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, parseFloat(price), parseInt(stock) || 0, image, category_id || null]
    );

    const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Product created.', product: product[0] });
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

// ─── PUT /api/products/:id (Admin) ───────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, is_active } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // If a new image is uploaded, delete the old one
    let image = existing[0].image;
    if (req.file) {
      if (image && image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE products SET name = ?, description = ?, price = ?, stock = ?,
       image = ?, category_id = ?, is_active = ? WHERE id = ?`,
      [
        name || existing[0].name,
        description !== undefined ? description : existing[0].description,
        price !== undefined ? parseFloat(price) : existing[0].price,
        stock !== undefined ? parseInt(stock) : existing[0].stock,
        image,
        category_id !== undefined ? category_id : existing[0].category_id,
        is_active !== undefined ? is_active : existing[0].is_active,
        req.params.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product updated.', product: updated[0] });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// ─── DELETE /api/products/:id (Admin) ────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Soft delete - mark as inactive
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

// ─── GET /api/categories ───────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories };
