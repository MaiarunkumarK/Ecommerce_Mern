// src/pages/UserDashboard.js

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { orderService } from '../api/services';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const statusConfig = {
  pending:    { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
  processing: { color: 'bg-blue-100 text-blue-800',   icon: <Package size={14} /> },
  shipped:    { color: 'bg-purple-100 text-purple-800', icon: <Truck size={14} /> },
  delivered:  { color: 'bg-green-100 text-green-800',  icon: <CheckCircle size={14} /> },
  cancelled:  { color: 'bg-red-100 text-red-800',     icon: <XCircle size={14} /> },
};

const UserDashboard = () => {
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.name}!</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Orders', value: orders.length, color: 'text-blue-600' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
          { label: 'Processing', value: orders.filter(o => o.status === 'processing' || o.status === 'shipped').length, color: 'text-purple-600' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Order History */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Order History</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package size={40} className="mx-auto mb-3" />
            <p>No orders yet. Start shopping!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => {
                  const s = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">#{order.id}</td>
                      <td className="py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-gray-500">{order.item_count} item(s)</td>
                      <td className="py-3 font-semibold">${parseFloat(order.total_amount).toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`badge ${s.color} flex items-center gap-1 w-fit`}>
                          {s.icon} {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
