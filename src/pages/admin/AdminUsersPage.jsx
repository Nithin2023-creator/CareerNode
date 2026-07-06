import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Loader2, Shield, ShieldOff } from 'lucide-react';
import { useToast } from '../../lib/toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.listUsers();
      setUsers(res);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (id) => {
    try {
      await adminApi.toggleAdmin(id);
      toast.success('Admin status updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update admin status');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">Users Management</h1>
        <p className="text-black/50 text-sm font-medium">View all registered users and manage admin access.</p>
      </div>

      <div className="bento-card bg-white border-2 border-black rounded-2xl shadow-[var(--shadow-lift)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black text-white font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-black font-medium divide-y divide-black/10">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4 font-bold flex items-center gap-3">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-black/10" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-black uppercase">
                        {user.name?.charAt(0) || user.email?.charAt(0)}
                      </div>
                    )}
                    {user.name || 'No Name'}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 text-black/50">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black/5 text-black/60 border border-black/10">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleAdmin(user._id)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors bg-black/5 hover:bg-black/10 text-black border border-transparent hover:border-black/20"
                    >
                      {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center font-bold text-black/40 uppercase tracking-widest text-sm">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
