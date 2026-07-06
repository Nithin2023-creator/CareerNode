import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Users, Building2, Package, CreditCard, Loader2 } from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Waitlist', value: stats?.totalWaitlist || 0, icon: Users, color: 'text-orange-600 bg-orange-100' },
    { label: 'Companies', value: stats?.totalCompanies || 0, icon: Building2, color: 'text-purple-600 bg-purple-100' },
    { label: 'HR Bundles', value: stats?.totalBundles || 0, icon: Package, color: 'text-green-600 bg-green-100' },
    { label: 'Purchases', value: stats?.totalPurchases || 0, icon: CreditCard, color: 'text-yellow-600 bg-yellow-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">Dashboard Overview</h1>
        <p className="text-black/50 text-sm font-medium">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bento-card bg-white border-2 border-black rounded-2xl p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border-2 border-black ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-black/60 text-[10px] font-bold tracking-widest uppercase mb-1">{stat.label}</p>
              <h3 className="font-display text-5xl font-bold text-black">{stat.value}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
