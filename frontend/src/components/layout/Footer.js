// src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
          <Package size={20} /> ShopEase
        </div>
        <p className="text-sm text-gray-400">Your one-stop shop for everything you need, delivered fast.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
          <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
          <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
          <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="mailto:support@shopease.com" className="hover:text-white transition-colors">support@shopease.com</a></li>
          <li><span>Mon–Fri, 9am–5pm EST</span></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
      © {new Date().getFullYear()} ShopEase. All rights reserved. Payments secured by Stripe.
    </div>
  </footer>
);

export default Footer;
