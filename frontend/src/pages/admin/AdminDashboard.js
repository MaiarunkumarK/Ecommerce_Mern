// src/pages/admin/AdminDashboard.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/services';
import { Users, Package, ShoppingBag, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { title: 'Total Users',    value: stats.stats.totalUsers,    icon: <Users size={28} />,       color: 'text-blue-600',   bg: 'bg-blue-50' },
    { title: 'Products',       value: stats.stats.totalProducts, icon: <Package size={28} />,     color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Orders',         value: stats.stats.totalOrders,   icon: <ShoppingBag size={28} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Revenue (USD)',  value: `$${parseFloat(stats.stats.totalRevenue).toFixed(2)}`, icon: <DollarSign size={28} />, color: 'text-green-600', bg: 'bg-green-50' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/admin/products', label: 'Manage Products', icon: '📦' },
          { to: '/admin/orders',   label: 'View Orders',     icon: '🛒' },
          { to: '/admin/users',    label: 'Manage Users',    icon: '👥' },
          { to: '/products',       label: 'Visit Store',     icon: '🏪' },
        ].map((link) => (
          <Link key={link.to} to={link.to}
            className="card flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
            <span className="text-3xl">{link.icon}</span>
            <span className="text-sm font-medium text-gray-700">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.title} className={`card flex items-center gap-4`}>
              <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      {stats?.recentOrders?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-600 text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Order #</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-2 font-medium">#{order.id}</td>
                    <td className="py-2 text-gray-600">{order.user_name}</td>
                    <td className="py-2 font-semibold">${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="py-2">
                      <span className="badge bg-blue-100 text-blue-800">{order.status}</span>
                    </td>
                    <td className="py-2 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
