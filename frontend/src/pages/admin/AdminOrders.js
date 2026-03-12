// src/pages/admin/AdminOrders.js

import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllOrders({ limit: 100 })
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Orders</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Order #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">#{order.id}</td>
                  <td className="py-3">{order.user_name}</td>
                  <td className="py-3 text-gray-400 text-xs">{order.user_email}</td>
                  <td className="py-3">{order.item_count}</td>
                  <td className="py-3 font-semibold">${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`badge ${statusColors[order.status] || ''}`}>{order.status}</span>
                  </td>
                  <td className="py-3 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center py-8 text-gray-400">No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
