// controllers/productController.js - Product CRUD Operations

const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');

// ─── GET /api/products ─────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12, sort = 'createdAt', order = 'DESC' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const filter = { is_active: true };

    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    if (category) {
      const cat = await Category.findOne({ name: category });
      if (cat) filter.category = cat._id;
    }

    const sortObj = { [sort === 'id' ? '_id' : sort]: order.toUpperCase() === 'ASC' ? 1 : -1 };
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).populate('category', 'name').sort(sortObj).skip((pageNum - 1) * limitNum).limit(limitNum).lean();

    const normalized = products.map((p) => ({ ...p, id: p._id, category_name: p.category?.name || null, category_id: p.category?._id || null }));
    res.json({ success: true, products: normalized, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// ─── GET /api/products/:id ─────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, is_active: true }).populate('category', 'name').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product: { ...product, id: product._id, category_name: product.category?.name || null } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// ─── POST /api/products (Admin) ───────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || null;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required.' });

    const product = await Product.create({ name, description, price: parseFloat(price), stock: parseInt(stock) || 0, image, category: category_id || null });
    await product.populate('category', 'name');
    res.status(201).json({ success: true, message: 'Product created.', product });
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

// ─── PUT /api/products/:id (Admin) ───────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, is_active } = req.body;
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (req.file) {
      if (existing.image && existing.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      existing.image = `/uploads/${req.file.filename}`;
    }

    if (name !== undefined) existing.name = name;
    if (description !== undefined) existing.description = description;
    if (price !== undefined) existing.price = parseFloat(price);
    if (stock !== undefined) existing.stock = parseInt(stock);
    if (category_id !== undefined) existing.category = category_id || null;
    if (is_active !== undefined) existing.is_active = is_active;

    await existing.save();
    await existing.populate('category', 'name');
    res.json({ success: true, message: 'Product updated.', product: existing });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// ─── DELETE /api/products/:id (Admin) ────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.is_active = false;
    await product.save();
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

// ─── GET /api/categories ───────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories };
