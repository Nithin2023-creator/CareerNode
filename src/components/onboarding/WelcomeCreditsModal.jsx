import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Briefcase, Mail, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWelcomeCredits } from '../../context/WelcomeCreditsContext';

export default function WelcomeCreditsModal() {
  const { isOpen, closeModal, welcomeAmount } = useWelcomeCredits();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Close on Escape key and focus trap setup
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bento-card relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-6 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-black" />
            </button>

            {/* Header / Hero */}
            <div className="flex flex-col items-center text-center mb-8 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 bg-[var(--color-accent-yellow)] opacity-20 rounded-full blur-2xl mix-blend-multiply pointer-events-none" />
              
              <div className="pill-badge bg-[var(--color-accent-yellow)]/20 text-[var(--color-accent-yellow)] border-[var(--color-accent-yellow)]/30 mb-4 px-3 py-1 text-xs">
                WELCOME BONUS
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-2 z-10">
                <div className="p-3 bg-[var(--color-accent-yellow)]/20 rounded-full">
                  <Coins className="h-8 w-8 text-[var(--color-accent-yellow)]" />
                </div>
                <div className="font-display text-7xl font-bold text-[var(--color-accent-yellow)] leading-none tracking-tight">
                  {welcomeAmount}
                </div>
              </div>
              
              <p className="font-bold text-lg text-black mt-2 z-10">Free credits to explore CareerNode</p>
            </div>

            {/* Body */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-black/5 rounded-lg mt-0.5">
                  <Briefcase className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Job Finder</p>
                  <p className="text-xs text-black/60 font-medium">Subscribe to AI-curated company career pages.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-black/5 rounded-lg mt-0.5">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Cold Mailer</p>
                  <p className="text-xs text-black/60 font-medium">Send personalized emails directly to recruiters.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-black/5 rounded-lg mt-0.5">
                  <FileText className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Resume Maker</p>
                  <p className="text-xs text-black/60 font-medium">Tailor your resume specifically for any ATS.</p>
                </div>
              </div>
            </div>

            {/* Fine print & Actions */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-6">
                No credit card required. Buy more credits anytime from your wallet.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    closeModal();
                    navigate('/dashboard');
                  }}
                  className="w-full pill-btn bg-[var(--color-accent-yellow)] text-black hover:bg-[var(--color-accent-yellow)]/90 flex justify-center !py-3.5"
                >
                  Start Exploring
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    navigate('/dashboard/job-finder/wallet');
                  }}
                  className="w-full pill-btn-secondary bg-white text-black border-black/20 hover:bg-black/5 flex justify-center !py-3.5"
                >
                  View Wallet
                </button>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
