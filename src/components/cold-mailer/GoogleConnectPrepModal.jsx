import React, { useEffect } from 'react';
import { X, PlugZap, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PREP_SEEN_KEY = 'gmail_oauth_prep_seen';

function CheckboxCallout({ condensed = false }) {
  return (
    <div
      className={`rounded-[16px] border-2 border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/5 ${
        condensed ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start gap-4">
        {!condensed && (
          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent-blue)] text-white text-xs font-bold mt-0.5">
            4
          </span>
        )}
        <div className="flex-1">
          <p className={`font-bold leading-relaxed text-black ${condensed ? 'text-xs' : 'text-sm'}`}>
            {condensed
              ? 'Don\u2019t forget to tick the checkbox below before continuing:'
              : 'On the next screen, you must tick the checkbox \u2014 it is easy to miss and Google leaves it unchecked by default:'}
          </p>
          <div className="mt-3 rounded-[12px] bg-black text-white p-3 flex items-center gap-3">
            <CheckSquare className="h-5 w-5 flex-shrink-0 text-[var(--color-accent-blue)]" />
            <span className="text-sm font-medium">Send email on your behalf</span>
          </div>
          {!condensed && (
            <p className="text-xs text-black/50 font-medium mt-2 flex items-center gap-1.5">
              <Square className="h-3.5 w-3.5 flex-shrink-0" />
              If it looks unchecked like this, click it before pressing Continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationBanner({ condensed = false }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[16px] bg-[var(--color-accent-yellow)]/10 border-2 border-[var(--color-accent-yellow)]/40 ${
        condensed ? 'p-3' : 'p-4'
      }`}
    >
      <ShieldCheck className={`flex-shrink-0 text-yellow-600 mt-0.5 ${condensed ? 'h-4 w-4' : 'h-5 w-5'}`} />
      <p className={`font-medium text-yellow-800 leading-relaxed ${condensed ? 'text-xs' : 'text-sm'}`}>
        {condensed
          ? "CareerNode is pending Google's official verification — this warning will disappear once approved."
          : "We've submitted CareerNode for Google's official verification and expect approval soon. Once verified, this warning screen will disappear for all users."}
      </p>
    </div>
  );
}

export default function GoogleConnectPrepModal({ isOpen, onClose, onContinue }) {
  const hasSeenPrep =
    isOpen && typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PREP_SEEN_KEY) === 'true';

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

  const handleContinue = () => {
    sessionStorage.setItem(PREP_SEEN_KEY, 'true');
    onContinue();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bento-card bg-white w-full max-w-lg relative z-10 overflow-hidden flex flex-col shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-8 pb-6 px-8 text-center border-b border-black/5">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-[var(--color-accent-blue)]/20 rounded-[16px]">
                  <PlugZap className="h-6 w-6 text-[var(--color-accent-blue)]" />
                </div>
              </div>
              <h2 className="font-display font-bold uppercase leading-tight tracking-tight text-black text-2xl">
                Connecting your Gmail
              </h2>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {hasSeenPrep ? (
                <div className="space-y-4">
                  <p className="text-black/60 font-medium leading-relaxed text-center">
                    Ready to reconnect your Gmail. Remember to select <strong>Advanced</strong> and then{' '}
                    <strong>Go to CareerNode (unsafe)</strong> on the warning screen.
                  </p>
                  <CheckboxCallout condensed />
                  <VerificationBanner condensed />
                </div>
              ) : (
                <>
                  <p className="text-black/60 font-medium leading-relaxed text-center">
                    CareerNode uses Google&apos;s secure OAuth to send campaigns from your own Gmail — we never see or store your password.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 rounded-[16px] bg-black/[0.03]">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black/10 text-black text-xs font-bold mt-0.5">
                        1
                      </span>
                      <p className="text-sm font-medium leading-relaxed">
                        Google will show a screen that says &quot;Google hasn&apos;t verified this app.&quot; This is expected — we&apos;re a small team currently completing Google&apos;s verification review.
                      </p>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-[16px] bg-black/[0.03]">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black/10 text-black text-xs font-bold mt-0.5">
                        2
                      </span>
                      <p className="text-sm font-medium leading-relaxed">
                        Click <strong>Advanced</strong> at the bottom left of that screen.
                      </p>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-[16px] bg-black/[0.03]">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black/10 text-black text-xs font-bold mt-0.5">
                        3
                      </span>
                      <p className="text-sm font-medium leading-relaxed">
                        Click <strong>Go to CareerNode (unsafe)</strong> to continue. This label is standard for all apps pending verification — it does not mean anything is wrong.
                      </p>
                    </div>
                  </div>

                  <CheckboxCallout />

                  <VerificationBanner />
                </>
              )}
            </div>

            <div className="p-6 bg-black/[0.02] border-t border-black/5 flex flex-wrap-reverse items-center justify-between gap-4">
              <button onClick={onClose} className="pill-btn-secondary w-full sm:w-auto">
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="pill-btn w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <PlugZap className="h-5 w-5" /> Continue to Google
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
