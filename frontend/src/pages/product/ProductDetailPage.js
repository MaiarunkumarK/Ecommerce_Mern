// src/pages/product/ProductDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productService } from '../../api/services';
import { addToCart } from '../../store/cartSlice';
import { ShoppingCart, ArrowLeft, Tag, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productService.getById(id);
        setProduct(data.product);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }
    setAdding(true);
    const result = await dispatch(addToCart({ product_id: product.id, quantity: qty }));
    setAdding(false);
    if (addToCart.fulfilled.match(result)) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.payload || 'Failed to add to cart');
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-400 text-lg">Product not found.</p>
      <Link to="/products" className="text-blue-600 hover:underline mt-2 block">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/products" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="rounded-xl overflow-hidden border bg-gray-50 h-96">
          <img
            src={product.image || 'https://via.placeholder.com/600x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          {product.category_name && (
            <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
              <Tag size={14} /> {product.category_name}
            </span>
          )}

          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

          <p className="text-3xl font-bold text-blue-600">${parseFloat(product.price).toFixed(2)}</p>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className="text-gray-400" />
            {product.stock > 0 ? (
              <span className={product.stock <= 5 ? 'text-orange-600' : 'text-green-600'}>
                {product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-bold">−</button>
                <span className="px-4 py-2 text-center w-12">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-bold">+</button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="flex items-center justify-center gap-2 btn-primary w-full py-3 text-base mt-2"
          >
            <ShoppingCart size={20} />
            {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {!isAuthenticated && (
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link> to add items to cart
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
