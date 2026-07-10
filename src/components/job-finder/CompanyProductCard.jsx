import React from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { useCart } from '../../pages/job-finder/CartContext';

export default function CompanyProductCard({ company, isSubscribed }) {
  const { cart, addToCart } = useCart();
  const inCart = cart.some(c => c.id === company.id);

  return (
    <div className="bento-card bg-white p-4 md:p-6 lg:p-8 flex flex-col justify-between h-full border border-black/5 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] transition-all group">
      <div>
        <div className="flex justify-between items-start mb-3 md:mb-6">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-8 w-8 md:h-14 md:w-14 rounded-full border border-black/10 object-cover" />
          ) : (
            <div className="h-8 w-8 md:h-14 md:w-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center">
              <span className="font-display font-bold text-sm md:text-xl">{company.name.charAt(0)}</span>
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

        <h3 className="font-display text-lg md:text-3xl font-bold leading-tight mb-0.5 md:mb-2 line-clamp-1">{company.name}</h3>
        <p className="text-[9px] md:text-sm font-bold uppercase tracking-widest text-black/40 mb-2 md:mb-4 line-clamp-1">{company.category}</p>
        
        <div className="flex items-center gap-1.5 md:gap-2 text-[var(--color-accent-blue)] text-[9px] md:text-sm font-bold bg-[var(--color-accent-blue)]/5 w-fit px-2 md:px-3 py-1 md:py-1.5 rounded-full mb-3 md:mb-6 whitespace-nowrap">
          <Search className="h-3 w-3 md:h-4 md:w-4" />
          {company.openRoles} ROLES
        </div>
        
        <p className="hidden md:block text-black/60 font-medium leading-relaxed mb-6 line-clamp-2">
          {company.description}
        </p>
      </div>

      <div className="mt-auto border-t border-black/5 pt-3 md:pt-6">
        <div className="flex flex-wrap md:flex-col lg:flex-row items-baseline md:items-start lg:items-end justify-between mb-3 md:mb-4 gap-x-2 gap-y-1">
          <div className="flex items-baseline md:flex-col md:items-start gap-1 md:gap-0">
            <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-black/40 mb-1">1 Month Plan</span>
            <span className="font-display text-sm xs:text-base md:text-2xl font-bold whitespace-nowrap">{company.creditCost} Credits</span>
          </div>
          <div className="flex items-baseline lg:items-end gap-1 text-right">
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-black/30 md:block md:mb-1">or</span>
            <span className="font-bold text-xs md:text-base text-black/50">₹{company.alaCartePrice}</span>
          </div>
        </div>

        {isSubscribed ? (
          <button disabled className="w-full inline-flex justify-center items-center gap-1.5 md:gap-2 px-2 md:px-6 py-2 md:py-3 rounded-full bg-white text-black/40 border border-black/10 text-[10px] md:text-base font-bold cursor-not-allowed shadow-[var(--shadow-soft)] leading-none">
            <Check className="h-3 w-3 md:h-5 md:w-5 shrink-0" /> <span className="truncate pt-0.5">SUBSCRIBED</span>
          </button>
        ) : inCart ? (
          <button disabled className="w-full pill-btn-secondary bg-white text-black border-black/20 flex justify-center items-center gap-1.5 md:gap-2 !py-2 md:!py-3 !px-2 md:!px-6 text-[10px] md:text-base leading-none">
            <Check className="h-3 w-3 md:h-5 md:w-5 shrink-0" /> <span className="truncate pt-0.5">IN CART</span>
          </button>
        ) : (
          <button 
            onClick={() => addToCart(company)}
            className="w-full pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] flex justify-center items-center gap-1.5 md:gap-2 transition-colors !py-2 md:!py-3 !px-2 md:!px-6 text-[10px] md:text-base leading-none"
          >
            <Plus className="h-3 w-3 md:h-5 md:w-5 shrink-0" /> <span className="truncate pt-0.5">ADD TO CART</span>
          </button>
        )}
      </div>
    </div>
  );
}
