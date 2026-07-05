import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../pages/job-finder/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, wallet } = useCart();
  const navigate = useNavigate();

  const totalCredits = cart.reduce((sum, item) => sum + (item.creditCost || 0), 0);
  const remainingBalance = wallet.balance - totalCredits;
  const isShortfall = remainingBalance < 0;

  const handleCheckout = () => {
    onClose();
    navigate('/dashboard/job-finder/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--color-background)] border-l border-black/10 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/10 flex justify-between items-center bg-white">
              <h2 className="font-display text-2xl font-bold uppercase flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" /> Your Cart
              </h2>
              <button 
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-black/40 space-y-4">
                  <ShoppingCart className="h-16 w-16 mb-2 opacity-50" />
                  <p className="font-bold uppercase tracking-widest text-sm">Your cart is empty</p>
                  <button onClick={onClose} className="pill-btn-secondary mt-4">
                    BROWSE MARKETPLACE
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bento-card p-4 bg-white border border-black/5 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {item.logoUrl ? (
                        <img src={item.logoUrl} alt={item.name} className="h-10 w-10 rounded-full border border-black/10 flex-shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-black/5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold truncate text-lg">{item.name}</h4>
                        <p className="text-xs font-bold text-black/50 uppercase tracking-wide truncate">
                          1 Month Subscription
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-display text-xl font-bold">{item.creditCost}c</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-black/30 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-black/10 space-y-4">
                <div className="flex justify-between items-center text-black/60 font-bold uppercase tracking-widest text-xs">
                  <span>Current Balance</span>
                  <span>{wallet.balance} Credits</span>
                </div>
                <div className="flex justify-between items-center font-display text-2xl font-bold">
                  <span>Subtotal</span>
                  <span>{totalCredits} Credits</span>
                </div>
                
                <div className={`flex justify-between items-center font-bold uppercase tracking-widest text-xs py-2 border-t border-black/10 ${isShortfall ? 'text-red-500' : 'text-[var(--color-accent-blue)]'}`}>
                  <span>Balance After</span>
                  <span>{remainingBalance} Credits {isShortfall && '(Shortfall)'}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] flex items-center justify-center gap-2 mt-2"
                >
                  PROCEED TO CHECKOUT <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
