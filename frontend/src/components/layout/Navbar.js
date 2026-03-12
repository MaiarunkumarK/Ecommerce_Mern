// src/components/layout/Navbar.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { clearCartState } from '../../store/cartSlice';
import { ShoppingCart, User, Menu, X, Package, LogOut, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { itemCount } = useSelector((s) => s.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Package size={24} />
            <span>ShopEase</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors">Products</Link>

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative text-gray-600 hover:text-blue-600">
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                  >
                    <User size={20} />
                    <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={16} /> My Dashboard
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Package size={16} /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t pt-4">
            <Link to="/" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Products</Link>
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
                <Link to="/dashboard" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={handleLogout} className="block py-2 text-red-600 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2 text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
