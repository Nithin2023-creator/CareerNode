import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentOptions from './PaymentOptions';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../lib/toast';
import { pricingApi, walletApi } from '../../lib/api';
import { openCashfreeCheckout, pollOrderStatus } from '../../lib/cashfree';
import { ensureCreditsForAction, getCreditsConfirmLabel } from '../../lib/creditPacks';

/**
 * The unified paywall overlay. Driven by a `config` object (see usePaywall):
 *  - actionId          catalog key used to create the a la carte Cashfree order
 *  - label             heading shown to the user
 *  - description       optional sub-heading
 *  - creditCost        credits required
 *  - cashPrice         a la carte cash price to display
 *  - onPayWithCredits()            performs the action charging credits
 *  - onPayAlaCarte(paidOrderId)    performs the action redeeming a paid order
 */
export default function PaywallModal({ config, onClose }) {
  const { wallet, refreshWallet } = useWallet();
  const toast = useToast();

  const isOpen = !!config;
  const creditCost = config?.creditCost ?? 0;
  const balance = wallet?.balance ?? 0;
  const hasEnoughCredits = balance >= creditCost;

  const [method, setMethod] = useState('credits');
  const [busy, setBusy] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMethod(balance >= creditCost ? 'credits' : 'credits');
      setBusy(false);
      setSelectedPack(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const close = () => {
    if (busy) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!config) return;
    setBusy(true);
    try {
      if (method === 'credits') {
        await ensureCreditsForAction({
          balance,
          creditCost,
          selectedPack,
          refreshWallet,
        });
        await config.onPayWithCredits();
        await refreshWallet();
        onClose();
        return;
      }

      // A la carte: create order -> Cashfree -> poll -> redeem
      const { orderId, paymentSessionId } = await pricingApi.checkoutAction(config.actionId);
      await openCashfreeCheckout(paymentSessionId);
      const status = await pollOrderStatus((id) => walletApi.getOrderStatus(id), orderId);

      if (status !== 'paid') {
        throw new Error('Payment failed or was cancelled.');
      }

      await config.onPayAlaCarte(orderId);
      await refreshWallet();
      onClose();
    } catch (err) {
      console.error('Paywall error:', err);
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const canConfirm =
    method === 'alacarte' ||
    hasEnoughCredits ||
    (method === 'credits' && !!selectedPack);

  const confirmLabel =
    method === 'alacarte'
      ? 'CONFIRM & PAY'
      : getCreditsConfirmLabel({ hasEnoughCredits, selectedPack, creditCost });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bento-card bg-white w-full max-w-2xl relative z-10 overflow-hidden flex flex-col shadow-2xl max-h-[90vh]"
          >
            <button
              onClick={close}
              disabled={busy}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors z-20 disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-8 pb-6 px-6 sm:px-8 border-b border-black/5">
              <div className="pill-badge bg-black/5 text-black w-fit mb-3">CHECKOUT</div>
              <h2 className="font-display font-bold text-3xl uppercase tracking-tight leading-none">
                {config?.label || 'Complete Payment'}
              </h2>
              {config?.description && (
                <p className="text-sm font-medium text-black/60 mt-2">{config.description}</p>
              )}
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto">
              <PaymentOptions
                creditCost={creditCost}
                cashPrice={config?.cashPrice ?? 0}
                balance={balance}
                method={method}
                onMethodChange={setMethod}
                onSelectedPackChange={setSelectedPack}
              />
            </div>

            <div className="px-6 sm:px-8 py-5 border-t border-black/5 bg-black/[0.02] flex items-center justify-between gap-4">
              <div className="font-display font-bold text-2xl">
                {method === 'credits' ? `${creditCost}c` : `$${config?.cashPrice ?? 0}`}
              </div>
              <button
                onClick={handleConfirm}
                disabled={busy || !canConfirm}
                className="pill-btn bg-[var(--color-accent-blue)] text-white hover:bg-black disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
              >
                {busy ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    {confirmLabel} <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
