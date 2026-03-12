// src/api/services.js - All API service calls

import api from './axios';

// ─── Auth Services ─────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Product Services ──────────────────────────────────────────────────────────
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Cart Services ─────────────────────────────────────────────────────────────
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (product_id, quantity) => api.post('/cart/add', { product_id, quantity }),
  updateItem: (cart_id, quantity) => api.put('/cart/update', { cart_id, quantity }),
  removeItem: (cart_id) => api.delete('/cart/remove', { data: { cart_id } }),
  clearCart: () => api.delete('/cart/clear'),
};

// ─── Order Services ────────────────────────────────────────────────────────────
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
};

// ─── Payment Services ──────────────────────────────────────────────────────────
export const paymentService = {
  createCheckoutSession: (orderId) => api.post('/payment/create-checkout-session', { orderId }),
  verifyPayment: (sessionId) => api.get(`/payment/verify/${sessionId}`),
};

// ─── Admin Services ────────────────────────────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
};
