import React from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { useCart } from '../../pages/job-finder/CartContext';

export default function CompanyProductCard({ company, isSubscribed }) {
  const { cart, addToCart } = useCart();
  const inCart = cart.some(c => c.id === company.id);

  return (
    <div className="bento-card bg-white p-4 md:p-6 lg:p-8 flex flex-col justify-between h-full border border-black/5 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] transition-all group">
      <div>
        <div className="flex justify-between items-start mb-4 md:mb-6">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-10 w-10 md:h-14 md:w-14 rounded-full border border-black/10 object-cover" />
          ) : (
            <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center">
              <span className="font-display font-bold text-base md:text-xl">{company.name.charAt(0)}</span>
            </div>
          )}
          
          {company.tier === 'premium' ? (
            <div className="flex flex-col items-end gap-1">
              <span className="pill-badge bg-[var(--color-accent-yellow)]/20 text-[var(--color-accent-yellow)] border-[var(--color-accent-yellow)]/30 text-[9px] md:text-[11px] px-2 py-0.5 md:px-3 md:py-1">PREMIUM</span>
              <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Pro saves 15%</span>
            </div>
          ) : (
            <span className="pill-badge bg-black/5 text-black/50 text-[9px] md:text-[11px] px-2 py-0.5 md:px-3 md:py-1">STANDARD</span>
          )}
        </div>

        <h3 className="font-display text-xl md:text-3xl font-bold leading-tight mb-1 md:mb-2">{company.name}</h3>
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-black/40 mb-3 md:mb-4">{company.category}</p>
        
        <div className="flex items-center gap-2 text-[var(--color-accent-blue)] text-xs md:text-sm font-bold bg-[var(--color-accent-blue)]/5 w-fit px-2 md:px-3 py-1 md:py-1.5 rounded-full mb-4 md:mb-6">
          <Search className="h-3 w-3 md:h-4 md:w-4" />
          {company.openRoles} OPEN ROLES
        </div>
        
        <p className="hidden md:block text-black/60 font-medium leading-relaxed mb-6 line-clamp-2">
          {company.description}
        </p>
      </div>

      <div className="mt-auto border-t border-black/5 pt-4 md:pt-6">
        <div className="flex flex-row md:flex-col lg:flex-row items-center md:items-start lg:items-end justify-between mb-4 gap-2 lg:gap-0">
          <div className="flex items-baseline md:flex-col md:items-start gap-1.5 md:gap-0">
            <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-black/40 mb-1">1 Month Plan</span>
            <span className="font-display text-lg md:text-2xl font-bold">{company.creditCost} Credits</span>
          </div>
          <div className="flex items-center lg:items-end gap-1.5 lg:gap-0 text-right">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black/30 md:block md:mb-1">or</span>
            <span className="font-bold text-sm md:text-base text-black/50">₹{company.alaCartePrice}</span>
          </div>
        </div>

        {isSubscribed ? (
          <button disabled className="w-full inline-flex justify-center items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-white text-black/40 border border-black/10 text-sm md:text-base font-bold cursor-not-allowed shadow-[var(--shadow-soft)]">
            <Check className="h-4 w-4 md:h-5 md:w-5" /> SUBSCRIBED
          </button>
        ) : inCart ? (
          <button disabled className="w-full pill-btn-secondary bg-white text-black border-black/20 flex justify-center items-center gap-2 !py-2.5 md:!py-3 text-sm md:text-base">
            <Check className="h-4 w-4 md:h-5 md:w-5" /> IN CART
          </button>
        ) : (
          <button 
            onClick={() => addToCart(company)}
            className="w-full pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] flex justify-center items-center gap-2 transition-colors !py-2.5 md:!py-3 text-sm md:text-base"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" /> ADD TO CART
          </button>
        )}
      </div>
    </div>
  );
}
