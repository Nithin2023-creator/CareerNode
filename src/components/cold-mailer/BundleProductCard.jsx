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
      className="bento-card p-6 flex flex-col h-full bg-white relative group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="pill-badge bg-black/5 text-black mb-2 inline-flex">
            <Tag className="w-3 h-3 mr-1" />
            {bundle.category}
          </span>
          <h3 className="font-display text-xl font-bold uppercase">{bundle.name}</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-lg">${bundle.alaCartePrice}</span>
          <span className="text-sm text-black/40">or {bundle.creditCost} cr</span>
        </div>
      </div>

      <p className="text-black/60 text-sm mb-4 flex-grow">
        {bundle.description}
      </p>

      <div className="mb-6 space-y-2">
        <div className="flex items-center text-sm font-medium">
          <Users className="w-4 h-4 mr-2 text-[var(--color-accent-yellow)]" />
          {bundle.contactCount} HR Contacts
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {bundle.sampleTitles?.slice(0, 3).map((title, i) => (
            <span key={i} className="text-xs bg-black/5 px-2 py-1 rounded-full">
              {title}
            </span>
          ))}
          {bundle.sampleTitles?.length > 3 && (
            <span className="text-xs bg-black/5 px-2 py-1 rounded-full text-black/50">
              +{bundle.sampleTitles.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-black/5">
        {isOwned ? (
          <Link 
            to="/dashboard/emailer/bundles"
            className="bento-button w-full justify-center bg-[var(--color-accent-yellow)] text-black border-transparent"
          >
            <Check className="w-4 h-4 mr-2" />
            Owned
          </Link>
        ) : inCart ? (
          <button 
            disabled
            className="bento-button w-full justify-center bg-black text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            In Cart
          </button>
        ) : (
          <button 
            onClick={() => addToCart(bundle)}
            className="bento-button w-full justify-center bg-white hover:bg-black/5"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  );
}
