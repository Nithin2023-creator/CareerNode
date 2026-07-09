import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentOptions from '../payments/PaymentOptions';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../lib/toast';
import { coldMailerApi, walletApi } from '../../lib/api';
import { openCashfreeCheckout, pollOrderStatus } from '../../lib/cashfree';
import { ensureCreditsForAction, getCreditsConfirmLabel } from '../../lib/creditPacks';

export default function SendCheckoutModal({ isOpen, onClose, campaignId, campaignTitle, onConfirmSuccess }) {
  const { wallet, refreshWallet } = useWallet();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  
  const [method, setMethod] = useState('credits');
  const [selectedPack, setSelectedPack] = useState(null);
  const [infoExpanded, setInfoExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && campaignId) {
      loadCheckoutData();
      setInfoExpanded(false);
    }
  }, [isOpen, campaignId]);

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

  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      const res = await coldMailerApi.getSendCheckout(campaignId);
      setData(res);
      const cost = res.priceCredits || 0;
      setMethod((wallet?.balance || 0) >= cost ? 'credits' : 'credits');
    } catch (err) {
      toast.error(err.message || 'Failed to load checkout details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (busy) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!data) return;
    setBusy(true);
    try {
      if (method === 'credits') {
        await ensureCreditsForAction({
          balance: wallet?.balance || 0,
          creditCost: data.priceCredits,
          selectedPack,
          refreshWallet,
        });

        const result = await coldMailerApi.confirmSendCheckout(campaignId, 'credits');
        await refreshWallet();
        onConfirmSuccess(result);
        onClose();
        return;
      }

      // A la carte
      const result = await coldMailerApi.confirmSendCheckout(campaignId, 'alacarte');
      const { paymentSessionId, orderId } = result;
      await openCashfreeCheckout(paymentSessionId);

      const status = await pollOrderStatus((id) => walletApi.getOrderStatus(id), orderId);
      if (status !== 'paid') {
        throw new Error('Payment failed or was cancelled.');
      }

      // Webhook starts the send; poll until the campaign flips to Sending.
      let campaignStatus = null;
      for (let i = 0; i < 15; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const polled = await coldMailerApi.getCampaignStatus(campaignId);
        if (polled?.status === 'Sending') {
          campaignStatus = polled;
          break;
        }
      }

      await refreshWallet();
      onConfirmSuccess(campaignStatus);
      onClose();
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  const creditCost = data?.priceCredits || 0;
  const cashPrice = data?.priceInr || 0;
  const balance = wallet?.balance || 0;
  const hasEnoughCredits = balance >= creditCost;
  
  const canConfirm = !loading && data && (
    method === 'alacarte' ||
    hasEnoughCredits ||
    (method === 'credits' && !!selectedPack)
  );

  const confirmLabel =
    method === 'alacarte'
      ? 'CONFIRM & SEND'
      : getCreditsConfirmLabel({ hasEnoughCredits, selectedPack, creditCost: creditCost || 1 }).replace('PAY', 'SEND'); 

  // Compute daily limit visual progress
  // data.dailyRemainingAfter is what's left after this batch. 
  // Limit is 500, so sent before this batch = 500 - (data.dailyRemainingAfter + data.batchSize)
  const limit = 500;
  const sentBefore = data ? limit - (data.dailyRemainingAfter + data.batchSize) : 0;
  const sentTotal = sentBefore + (data?.batchSize || 0);
  const progressPercent = Math.min(100, Math.max(0, (sentTotal / limit) * 100));

  return (
    <AnimatePresence>
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
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors z-20 disabled:opacity-40 min-h-11 min-w-11 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pt-8 pb-6 px-6 sm:px-8 border-b border-black/5">
            <div className="pill-badge bg-black/5 text-black w-fit mb-3">SEND CHECKOUT</div>
            <h2 className="font-display font-bold text-3xl uppercase tracking-tight leading-none truncate pr-8">
              Ready to launch '{campaignTitle}'?
            </h2>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {loading ? (
              <div className="h-40 bg-black/5 rounded-[20px] animate-pulse" />
            ) : data && data.batchSize === 0 ? (
              <div className="p-6 bg-red-500/10 text-red-700 rounded-[20px] font-medium text-center">
                You have reached your daily send limit of 500 emails. Please try again tomorrow.
              </div>
            ) : data ? (
              <>
                {/* Daily Usage Ring / Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold uppercase text-black/60">Daily Usage</span>
                    <span className="text-sm font-bold">You've sent {sentTotal} / {limit} emails today</span>
                  </div>
                  <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--color-accent-yellow)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Batch Summary Card */}
                <div className="p-5 rounded-[20px] bg-black/[0.03] border border-black/5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {data.pendingRecipients <= data.batchSize ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-yellow)]/20 text-yellow-700 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      {data.pendingRecipients <= data.batchSize ? (
                        <p className="font-medium text-black">
                          Sending to all <strong>{data.pendingRecipients}</strong> pending recipients now.
                        </p>
                      ) : (
                        <p className="font-medium text-black">
                          Sending to <strong>{data.batchSize} of {data.pendingRecipients}</strong> recipients now — the rest will resume automatically once your daily allowance resets.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Why 500/day info callout */}
                <div className="rounded-[16px] overflow-hidden bg-[var(--color-accent-yellow)]/10 border border-[var(--color-accent-yellow)]/30">
                  <button
                    onClick={() => setInfoExpanded(!infoExpanded)}
                    className="w-full flex items-center justify-between p-4 text-yellow-800 font-medium text-sm hover:bg-black/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      Why only 500 emails per day?
                    </div>
                    {infoExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {infoExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="p-4 pt-0 text-sm text-yellow-900 leading-relaxed">
                          Sending more than ~500 cold emails a day from one Gmail account sharply increases the chance of landing in spam folders and can get your account flagged — which hurts the responses you get from HRs. We cap daily sends to protect your deliverability.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price Card */}
                <div>
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    <span className="pill-badge bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
                      {data.rate === 'pack' ? 'Best rate applied — Daily Send Pack' : 'Pay-as-you-go rate'}
                    </span>
                    {data.rate === 'pack' && (
                      <span className="pill-badge bg-emerald-500/10 text-emerald-700">
                        You saved ₹{Math.ceil(data.batchSize / 5) * 1 - cashPrice}
                      </span>
                    )}
                  </div>
                  <PaymentOptions
                    creditCost={creditCost}
                    cashPrice={cashPrice}
                    balance={balance}
                    method={method}
                    onMethodChange={setMethod}
                    onSelectedPackChange={setSelectedPack}
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="px-6 sm:px-8 py-5 border-t border-black/5 bg-black/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={close}
              className="pill-btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={busy || !canConfirm || data?.batchSize === 0}
              className="pill-btn w-full sm:w-auto bg-black text-[var(--color-accent-yellow)] hover:bg-black/90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {busy ? (
                <span className="animate-spin h-5 w-5 border-2 border-current rounded-full border-t-transparent" />
              ) : (
                <>
                  {data?.batchSize === 0 ? 'LIMIT REACHED' : confirmLabel} <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
