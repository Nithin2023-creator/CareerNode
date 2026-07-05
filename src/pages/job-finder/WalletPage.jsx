import React, { useState, useEffect } from 'react';
import { Wallet, Coins, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useCart } from './CartContext';
import { mockCreditPacks } from './mockData';
import { walletApi } from '../../lib/api';
import { withMockFallback, formatDate } from './helpers';
import { useToast } from '../../lib/toast';

export default function WalletPage() {
  const { wallet, refreshWallet } = useCart();
  const toast = useToast();
  const [processingPackId, setProcessingPackId] = useState(null);
  const [packs, setPacks] = useState(mockCreditPacks);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await withMockFallback(walletApi.getPacks(), mockCreditPacks);
      if (active && Array.isArray(data) && data.length) setPacks(data);
    })();
    return () => { active = false; };
  }, []);

  const handlePurchase = async (pack) => {
    setProcessingPackId(pack.id);
    try {
      await walletApi.purchasePack(pack.id);
      await refreshWallet();
      toast.success(`Successfully added ${pack.credits} credits to your wallet.`);
    } catch {
      toast.error('Failed to purchase credits. Please try again.');
    } finally {
      setProcessingPackId(null);
    }
  };

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

      {/* Credit Packs */}
      <div>
        <h2 className="font-display text-2xl font-bold uppercase mb-6 flex items-center gap-2">
          <Plus className="h-6 w-6" /> Buy Credits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div key={pack.id} className={`bento-card bg-white p-8 relative flex flex-col items-center text-center border-2 transition-all hover:-translate-y-1 ${pack.badge ? 'border-[var(--color-accent-yellow)] shadow-[var(--shadow-lift)]' : 'border-black/5 hover:shadow-[var(--shadow-soft)] hover:border-black/20'}`}>
              
              {pack.badge && (
                <div className="absolute -top-3 px-4 py-1 bg-[var(--color-accent-yellow)] text-black text-[10px] font-bold uppercase tracking-widest rounded-full border border-black/10">
                  {pack.badge}
                </div>
              )}
              
              <h3 className="font-display text-2xl font-bold uppercase mb-2">{pack.name}</h3>
              <div className="font-display text-5xl font-bold my-4 flex items-center gap-2">
                {pack.credits}<span className="text-2xl text-black/40">c</span>
              </div>
              <p className="text-xl font-bold text-black/50 mb-8">${pack.price}</p>
              
              <button 
                onClick={() => handlePurchase(pack)}
                disabled={processingPackId === pack.id}
                className={`w-full pill-btn flex items-center justify-center gap-2 ${pack.badge ? 'bg-black text-[var(--color-accent-yellow)] hover:bg-[var(--color-accent-yellow)] hover:text-black' : 'bg-white text-black border border-black hover:bg-black hover:text-white'}`}
              >
                {processingPackId === pack.id ? (
                  <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <>BUY NOW</>
                )}
              </button>
            </div>
          ))}
        </div>
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
