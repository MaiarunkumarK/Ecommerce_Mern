// src/pages/product/ProductsPage.js

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../api/services';
import ProductCard from '../../components/product/ProductCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'id';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productService.getAll({ search, category, page, limit: 12, sort });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, page, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    productService.getCategories().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value; else delete params[key];
    params.page = '1'; // Reset to first page on filter change
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Products</h1>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            defaultValue={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="input-field pl-10"
            placeholder="Search products..."
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="input-field w-full sm:w-44"
        >
          <option value="id">Latest</option>
          <option value="price">Price: Low to High</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        {loading ? 'Loading...' : `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`}
      </p>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => updateParam('page', page - 1)}
            disabled={page <= 1}
            className="btn-secondary p-2 disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => updateParam('page', i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors 
                ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => updateParam('page', page + 1)}
            disabled={page >= pagination.pages}
            className="btn-secondary p-2 disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
