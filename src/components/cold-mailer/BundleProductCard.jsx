import React from 'react';
import { useBundleCart } from '../../pages/cold-mailer/BundleCartContext';
import { Users, Tag, Check, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function BundleProductCard({ bundle }) {
  const { cart, addToCart } = useBundleCart();
  
  const isOwned = bundle.isOwned;
  const inCart = cart.some(item => item._id === bundle._id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card p-4 md:p-6 flex flex-col h-full bg-white relative group"
    >
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div>
          <span className="pill-badge bg-black/5 text-black mb-1.5 md:mb-2 inline-flex text-[9px] md:text-[11px] px-2 py-0.5 md:px-3 md:py-1">
            <Tag className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            {bundle.category}
          </span>
          <h3 className="font-display text-lg md:text-xl font-bold uppercase leading-tight">{bundle.name}</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-base md:text-lg leading-none">₹{bundle.alaCartePrice}</span>
          <span className="text-xs md:text-sm text-black/40 mt-1">or {bundle.creditCost} cr</span>
        </div>
      </div>

      <p className="hidden md:block text-black/60 text-sm mb-4 flex-grow line-clamp-2">
        {bundle.description}
      </p>

      <div className="mb-4 md:mb-6 space-y-2 mt-2 md:mt-0">
        <div className="flex items-center text-xs md:text-sm font-medium">
          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 text-[var(--color-accent-yellow)]" />
          {bundle.contactCount} HR Contacts
        </div>
        <div className="flex flex-wrap gap-1 md:gap-1.5 mt-2">
          {bundle.sampleTitles?.slice(0, 3).map((title, i) => (
            <span key={i} className="text-[10px] md:text-xs bg-black/5 px-2 py-1 rounded-full">
              {title}
            </span>
          ))}
          {bundle.sampleTitles?.length > 3 && (
            <span className="text-[10px] md:text-xs bg-black/5 px-2 py-1 rounded-full text-black/50">
              +{bundle.sampleTitles.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-black/5">
        {isOwned ? (
          <Link 
            to="/dashboard/emailer/bundles"
            className="bento-button w-full justify-center bg-[var(--color-accent-yellow)] text-black border-transparent !py-2.5 md:!py-3 text-sm md:text-base"
          >
            <Check className="w-4 h-4 mr-2" />
            Owned
          </Link>
        ) : inCart ? (
          <button 
            disabled
            className="bento-button w-full justify-center bg-black text-white !py-2.5 md:!py-3 text-sm md:text-base"
          >
            <Check className="w-4 h-4 mr-2" />
            In Cart
          </button>
        ) : (
          <button 
            onClick={() => addToCart(bundle)}
            className="bento-button w-full justify-center bg-white hover:bg-black/5 !py-2.5 md:!py-3 text-sm md:text-base"
          >
            <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  );
}
