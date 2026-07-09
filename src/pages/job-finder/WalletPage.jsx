import React, { useState, useEffect } from 'react';
import { Wallet, Coins, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useCart } from './CartContext';
import { membershipApi } from '../../lib/api';
import { formatDate } from './helpers';
import { Link } from 'react-router-dom';
import CreditPackGrid from '../../components/payments/CreditPackGrid';

export default function WalletPage() {
  const { wallet, refreshWallet } = useCart();
  const [myPlan, setMyPlan] = useState(null);

  useEffect(() => {
    membershipApi.getMe().then(res => setMyPlan(res)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Hero / Balance */}
      <div className="bento-card bg-black text-white p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-black/10 shadow-[var(--shadow-lift)]">
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-[var(--color-accent-yellow)] opacity-20 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 text-center md:text-left">
          <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2 flex items-center justify-center md:justify-start gap-2">
            <Wallet className="h-4 w-4" /> Current Balance
          </p>
          <div className="font-display text-7xl md:text-8xl font-bold text-[var(--color-accent-yellow)] leading-none tracking-tight">
            {wallet.balance}
          </div>
          <p className="mt-2 text-white/80 font-bold uppercase tracking-widest">Credits Available</p>
        </div>
        
        <div className="relative z-10 hidden md:flex items-center justify-center h-32 w-32 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
          <Coins className="h-16 w-16 text-[var(--color-accent-yellow)]" />
        </div>
      </div>

      {/* Membership Upsell Banner */}
      {false && myPlan?.planId?.tier === 'free' && (
        <div className="bento-card bg-[var(--color-accent-blue)]/5 border-2 border-[var(--color-accent-blue)]/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="font-display font-bold text-xl text-[var(--color-accent-blue)]">Get more value with Pro</h3>
            <p className="text-sm font-medium text-black/70 mt-1">
              Subscribe to Pro for monthly bonus credits and {myPlan?.planId?.alaCarteDiscountPercent || 15}% off all a la carte purchases.
            </p>
          </div>
          <Link to="/dashboard/billing" className="pill-btn shrink-0 bg-[var(--color-accent-blue)] text-white hover:bg-black whitespace-nowrap">
            UPGRADE NOW
          </Link>
        </div>
      )}

      {/* Credit Packs */}
      <div>
        <h2 className="font-display text-2xl font-bold uppercase mb-6 flex items-center gap-2">
          <Plus className="h-6 w-6" /> Buy Credits
        </h2>
        <CreditPackGrid onPurchased={refreshWallet} />
      </div>

      {/* Transaction History */}
      <div className="bento-card bg-white p-6 md:p-8 border border-black/5">
        <h2 className="font-display text-2xl font-bold uppercase mb-6 border-b border-black/10 pb-4">Transaction History</h2>
        
        {wallet.transactions.length === 0 ? (
          <div className="text-center py-12 text-black/40">
            <p className="font-bold uppercase tracking-widest text-sm mb-2">No transactions yet</p>
            <p className="text-xs">Your credit purchases and expenditures will appear here.</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="rounded-[16px] border border-black/10 p-4 bg-black/[0.02]">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <p className="text-sm font-bold">{tx.description}</p>
                    <div className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md shrink-0 ${tx.type === 'purchase' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {tx.type === 'purchase' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      {tx.type === 'purchase' ? '+' : ''}{tx.credits}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-black/50">
                    <span>{formatDate(tx.date)}</span>
                    <span>Balance: {tx.balanceAfter}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-black/40">Date</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-black/40">Description</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-black/40 text-right">Amount</th>
                  <th className="py-4 text-xs font-bold uppercase tracking-widest text-black/40 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {wallet.transactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-black/[0.02] transition-colors">
                    <td className="py-4 text-sm font-medium whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="py-4 text-sm font-bold">{tx.description}</td>
                    <td className="py-4 text-right">
                      <div className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md ${tx.type === 'purchase' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {tx.type === 'purchase' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        {tx.type === 'purchase' ? '+' : ''}{tx.credits}
                      </div>
                    </td>
                    <td className="py-4 text-sm font-bold text-black/50 text-right">{tx.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
