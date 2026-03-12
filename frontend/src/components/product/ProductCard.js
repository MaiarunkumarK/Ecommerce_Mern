// src/components/product/ProductCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Don't navigate on card click
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    const result = await dispatch(addToCart({ product_id: product.id, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.payload || 'Failed to add to cart');
    }
  };

  return (
    <Link to={`/products/${product.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Product Image */}
      <div className="relative overflow-hidden h-48 bg-gray-100">
        <img
          src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
        {product.category_name && (
          <span className="absolute top-2 left-2 badge bg-blue-100 text-blue-700">{product.category_name}</span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2 h-10">{product.description}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-blue-600">${parseFloat(product.price).toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg 
                       hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-orange-500 text-xs mt-2">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
