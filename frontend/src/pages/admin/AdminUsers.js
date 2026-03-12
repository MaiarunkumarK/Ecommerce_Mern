// src/pages/admin/AdminUsers.js

import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/services';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllUsers({ limit: 100 })
      .then(({ data }) => setUsers(data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      await adminService.toggleUser(id);
      setUsers(users.map((u) => u.id === id ? { ...u, is_active: !u.is_active } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Users</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading users...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">ID</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-400">#{u.id}</td>
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggle(u.id)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                          u.is_active
                            ? 'border-red-300 text-red-600 hover:bg-red-50'
                            : 'border-green-300 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
