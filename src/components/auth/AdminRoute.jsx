import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = localStorage.getItem('cn_token');
    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    authApi
      .me()
      .then((data) => {
        localStorage.setItem('cn_user', JSON.stringify(data.user));
        setStatus(data.user?.isAdmin ? 'authorized' : 'denied');
      })
      .catch(() => {
        localStorage.removeItem('cn_token');
        localStorage.removeItem('cn_user');
        setStatus('unauthenticated');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'denied') {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
