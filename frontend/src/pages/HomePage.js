// src/pages/HomePage.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../api/services';
import ProductCard from '../components/product/ProductCard';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await productService.getAll({ limit: 8, sort: 'id', order: 'DESC' });
        setFeatured(data.products);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Shop Everything<br />You Love
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Discover thousands of products at unbeatable prices. Fast shipping, easy returns, and secure payments.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/products" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Shop Now
              </Link>
              <Link to="/register" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-8xl">🛍️</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Truck size={32} className="text-blue-600" />, title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: <RefreshCw size={32} className="text-blue-600" />, title: 'Easy Returns', desc: '30-day hassle-free returns' },
            { icon: <ShieldCheck size={32} className="text-blue-600" />, title: 'Secure Payment', desc: 'Protected by Stripe' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3">
              {f.icon}
              <h3 className="font-semibold text-gray-800">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Latest Products</h2>
          <Link to="/products" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start shopping?</h2>
          <p className="text-gray-400 mb-8">Create your free account today and enjoy exclusive deals.</p>
          <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
