import React from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { useCart } from '../../pages/job-finder/CartContext';

export default function CompanyProductCard({ company, isSubscribed }) {
  const { cart, addToCart } = useCart();
  const inCart = cart.some(c => c.id === company.id);

  return (
    <div className="bento-card bg-white p-6 md:p-8 flex flex-col justify-between h-full border border-black/5 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] transition-all group">
      <div>
        <div className="flex justify-between items-start mb-6">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-14 w-14 rounded-full border border-black/10 object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center">
              <span className="font-display font-bold text-xl">{company.name.charAt(0)}</span>
            </div>
          )}
          
          {company.tier === 'premium' ? (
            <span className="pill-badge bg-[var(--color-accent-yellow)]/20 text-[var(--color-accent-yellow)] border-[var(--color-accent-yellow)]/30">PREMIUM</span>
          ) : (
            <span className="pill-badge bg-black/5 text-black/50">STANDARD</span>
          )}
        </div>

        <h3 className="font-display text-3xl font-bold leading-tight mb-2">{company.name}</h3>
        <p className="text-sm font-bold uppercase tracking-widest text-black/40 mb-4">{company.category}</p>
        
        <div className="flex items-center gap-2 text-[var(--color-accent-blue)] text-sm font-bold bg-[var(--color-accent-blue)]/5 w-fit px-3 py-1.5 rounded-full mb-6">
          <Search className="h-4 w-4" />
          {company.openRoles} OPEN ROLES
        </div>
        
        <p className="text-black/60 font-medium leading-relaxed mb-6 line-clamp-2">
          {company.description}
        </p>
      </div>

      <div className="mt-auto border-t border-black/5 pt-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-black/40 block mb-1">1 Month Plan</span>
            <span className="font-display text-2xl font-bold">{company.creditCost} Credits</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-black/30 block mb-1">or</span>
            <span className="font-bold text-black/50">${company.alaCartePrice}</span>
          </div>
        </div>

        {isSubscribed ? (
          <button disabled className="w-full pill-btn bg-black/5 text-black/40 border border-transparent cursor-not-allowed flex justify-center items-center gap-2">
            <Check className="h-5 w-5" /> SUBSCRIBED
          </button>
        ) : inCart ? (
          <button disabled className="w-full pill-btn-secondary bg-white text-black border-black/20 flex justify-center items-center gap-2">
            <Check className="h-5 w-5" /> IN CART
          </button>
        ) : (
          <button 
            onClick={() => addToCart(company)}
            className="w-full pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] flex justify-center items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> ADD TO CART
          </button>
        )}
      </div>
    </div>
  );
}
