// src/pages/cart/CartPage.js

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateCartItem, removeFromCart } from '../../store/cartSlice';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, total, loading } = useSelector((s) => s.cart);

  const handleQtyChange = async (cart_id, quantity) => {
    const result = await dispatch(updateCartItem({ cart_id, quantity }));
    if (updateCartItem.rejected.match(result)) {
      toast.error(result.payload || 'Failed to update');
    }
  };

  const handleRemove = async (cart_id) => {
    const result = await dispatch(removeFromCart(cart_id));
    if (removeFromCart.fulfilled.match(result)) {
      toast.success('Item removed');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-center">Loading cart...</div>;

  if (!cartItems.length) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-600 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Start adding products you love!</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border p-4 flex gap-4">
              <img
                src={item.image || 'https://via.placeholder.com/80?text=No+Image'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg border"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-blue-600 font-bold">${parseFloat(item.price).toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-2">
                  {/* Quantity Controls */}
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-lg font-bold">−</button>
                    <span className="px-3">{item.quantity}</span>
                    <button onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-lg font-bold disabled:opacity-40">+</button>
                  </div>
                  <button onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card h-fit sticky top-20">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-600">
                <span className="truncate max-w-32">{item.name} × {item.quantity}</span>
                <span>${parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-gray-800 text-lg">
            <span>Total</span>
            <span>${parseFloat(total).toFixed(2)}</span>
          </div>
          <button onClick={() => navigate('/checkout')}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            Checkout <ArrowRight size={18} />
          </button>
          <Link to="/products" className="block text-center text-sm text-blue-600 hover:underline mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
