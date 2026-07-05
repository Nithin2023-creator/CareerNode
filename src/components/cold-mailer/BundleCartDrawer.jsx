import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBundleCart } from '../../pages/cold-mailer/BundleCartContext';
import { useWallet } from '../../context/WalletContext';
import { X, Trash2, ShoppingCart, CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BundleCartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart } = useBundleCart();
  const { wallet } = useWallet();
  const navigate = useNavigate();

  const totalCredits = cart.reduce((sum, item) => sum + item.creditCost, 0);
  const totalAlaCarte = cart.reduce((sum, item) => sum + item.alaCartePrice, 0);
  const shortfall = Math.max(0, totalCredits - (wallet?.balance || 0));

  const handleCheckout = () => {
    onClose();
    navigate('/dashboard/emailer/marketplace/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--color-background)] border-l border-black/10 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-black/10 flex justify-between items-center bg-white">
              <h2 className="font-display text-2xl font-bold uppercase flex items-center">
                <ShoppingCart className="mr-3" />
                Your Cart
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-black/40">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium text-lg">Your cart is empty</p>
                  <button onClick={onClose} className="mt-4 text-black underline underline-offset-4 font-bold">
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item._id} className="bento-card p-4 bg-white flex justify-between items-start group">
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                        <span className="text-sm bg-black/5 px-2 py-1 rounded-md text-black/60">
                          {item.contactCount} Contacts
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold">{item.creditCost} cr</span>
                        <span className="text-xs text-black/40 mb-2">${item.alaCartePrice}</span>
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-black/10">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-black/60">
                    <span>Current Balance</span>
                    <span className="font-bold text-black">{wallet?.balance || 0} cr</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Total Cost</span>
                    <div className="text-right">
                      <span className="font-bold block">{totalCredits} cr</span>
                      <span className="text-sm text-black/40">or ${totalAlaCarte}</span>
                    </div>
                  </div>
                  {shortfall > 0 && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-start border border-red-100">
                      <CreditCard className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      You are short {shortfall} credits. You can purchase credits or pay via credit card at checkout.
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleCheckout}
                  className="bento-button w-full justify-between bg-black text-white hover:bg-black/90 py-4 text-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
