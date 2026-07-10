import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Loader2, TrendingUp, CreditCard, Package } from 'lucide-react';
import { useToast } from '../../lib/toast';

export default function AdminTransactionsPage() {
  const [data, setData] = useState({ walletTransactions: [], bundlePurchases: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('wallet'); // 'wallet' or 'bundles'
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminApi.listTransactions();
      setData(res);
    } catch (err) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  }

  // Calculate some quick stats
  const totalCreditsBought = data.walletTransactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.credits, 0);

  const totalBundlesBought = data.bundlePurchases.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">Transactions</h1>
        <p className="text-black/50 text-sm font-medium">Monitor wallet top-ups and HR bundle purchases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card bg-white border-2 border-black rounded-2xl p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-black/50 text-xs font-bold uppercase tracking-widest mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" /> Total Credits Bought
          </div>
          <div className="font-display text-3xl font-bold text-black">{totalCreditsBought}</div>
        </div>
        <div className="bento-card bg-white border-2 border-black rounded-2xl p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 text-black/50 text-xs font-bold uppercase tracking-widest mb-2">
            <Package className="w-4 h-4 text-purple-600" /> Bundles Sold
          </div>
          <div className="font-display text-3xl font-bold text-black">{totalBundlesBought}</div>
        </div>
      </div>

      <div className="bento-card bg-white border-2 border-black rounded-2xl shadow-[var(--shadow-lift)] overflow-hidden">
        <div className="border-b-2 border-black flex">
          <button
            onClick={() => setView('wallet')}
            className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${
              view === 'wallet' ? 'bg-[var(--color-bg)] text-black border-r-2 border-black' : 'bg-white text-black/40 hover:text-black/70 border-r-2 border-black'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Wallet Top-ups
          </button>
          <button
            onClick={() => setView('bundles')}
            className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${
              view === 'bundles' ? 'bg-[var(--color-bg)] text-black' : 'bg-white text-black/40 hover:text-black/70'
            }`}
          >
            <Package className="w-4 h-4" /> Bundle Purchases
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black text-white font-bold uppercase tracking-widest text-[10px]">
              {view === 'wallet' ? (
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Credits</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Bundle</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4 text-right">Price Paid</th>
                </tr>
              )}
            </thead>
            <tbody className="text-black font-medium divide-y divide-black/10">
              {view === 'wallet' ? (
                data.walletTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4">{new Date(tx.date).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{tx.userId?.email || tx.userId?.name || '—'}</td>
                    <td className="px-6 py-4 font-bold">{tx.description}</td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.type === 'grant' ? 'text-blue-600' : tx.type === 'purchase' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'purchase' || tx.type === 'grant' ? '+' : '-'}{tx.credits}
                    </td>
                  </tr>
                ))
              ) : (
                data.bundlePurchases.map((tx, i) => (
                  <tr key={i} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4">{new Date(tx.purchasedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{tx.userId?.email || tx.userId?.name || '—'}</td>
                    <td className="px-6 py-4 font-bold">{tx.bundleId?.name || 'Unknown Bundle'}</td>
                    <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-widest text-black/60">{tx.paymentMethod}</td>
                    <td className="px-6 py-4 text-right font-bold">
                      {tx.paymentMethod === 'credits' ? <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">{tx.pricePaid} Cr</span> : `₹${tx.pricePaid}`}
                    </td>
                  </tr>
                ))
              )}
              {((view === 'wallet' && data.walletTransactions.length === 0) || 
                (view === 'bundles' && data.bundlePurchases.length === 0)) && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center font-bold text-black/40 uppercase tracking-widest text-sm">No transactions found in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
