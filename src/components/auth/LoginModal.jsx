import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from './AuthForm';

export default function LoginModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bento-card bg-white w-full max-w-md relative z-10 overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Brand */}
            <div className="pt-8 pb-6 px-8 text-center border-b border-black/5">
              <h2 className="font-display font-bold lowercase leading-none tracking-tight text-black text-2xl flex items-center justify-center gap-1">
                career node
                <span className="w-1.5 h-1.5 bg-black rounded-full mb-0.5 ml-0.5" />
              </h2>
            </div>

            {/* Content (AuthForm) */}
            <div className="p-8">
              <AuthForm onSuccess={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
