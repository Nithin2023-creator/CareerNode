import React from 'react';
import { Coins, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CreditPackGrid from './CreditPackGrid';

/**
 * Unified, dynamic payment selector shared across the app. It is purely
 * presentational + selection: the parent owns the actual payment/confirm action
 * based on the selected `method`.
 *
 * Props:
 *  - creditCost   number  credits required for the action/cart
 *  - cashPrice    number|string  cash price to display for the a la carte option
 *  - balance      number  current wallet balance
 *  - method       'credits' | 'alacarte'  currently selected method (controlled)
 *  - onMethodChange(method)
 *  - onCreditsPurchased()  called after an inline top-up succeeds
 *  - allowCredits boolean  whether the credits option is offered (default true)
 *  - creditsHint  string   optional sub-label under the credits option
 */
export default function PaymentOptions({
  creditCost = 0,
  cashPrice = 0,
  balance = 0,
  method = 'credits',
  onMethodChange,
  onCreditsPurchased,
  onSelectedPackChange,
  allowCredits = true,
  creditsHint,
}) {
  const hasEnoughCredits = balance >= creditCost;
  const shortfall = Math.max(0, creditCost - balance);
  const [selectedPack, setSelectedPack] = React.useState(null);

  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
    if (onSelectedPackChange) onSelectedPackChange(pack);
  };

  // Reset pack selection when method or balance changes.
  React.useEffect(() => {
    if (method !== 'credits' || hasEnoughCredits) {
      setSelectedPack(null);
      if (onSelectedPackChange) onSelectedPackChange(null);
    }
  }, [method, hasEnoughCredits, onSelectedPackChange]);

  const select = (m) => {
    if (onMethodChange) onMethodChange(m);
  };

  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-1 ${allowCredits ? 'sm:grid-cols-2' : ''} gap-4`}>
        {allowCredits && (
          <button
            type="button"
            onClick={() => select('credits')}
            className={`p-5 rounded-[24px] border-2 text-left transition-all relative overflow-hidden ${
              method === 'credits'
                ? 'border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/5'
                : 'border-black/10 hover:border-black/30'
            }`}
          >
            <Coins className={`h-7 w-7 mb-3 ${method === 'credits' ? 'text-[var(--color-accent-blue)]' : 'text-black/40'}`} />
            <h4 className="font-bold text-lg">Pay with Credits</h4>
            <p className="text-sm font-medium text-black/60 mt-1">
              {creditsHint || 'Deduct from your wallet balance'}
            </p>

            <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center text-sm font-bold uppercase tracking-widest">
              <span className="text-black/40">Cost</span>
              <span className="text-black">{creditCost}c</span>
            </div>
            <div className="mt-2 flex justify-between items-center text-sm font-bold uppercase tracking-widest">
              <span className="text-black/40">Balance</span>
              <span className={hasEnoughCredits ? 'text-black' : 'text-red-500'}>{balance}c</span>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => select('alacarte')}
          className={`p-5 rounded-[24px] border-2 text-left transition-all ${
            method === 'alacarte'
              ? 'border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/5'
              : 'border-black/10 hover:border-black/30'
          }`}
        >
          <CreditCard className={`h-7 w-7 mb-3 ${method === 'alacarte' ? 'text-[var(--color-accent-blue)]' : 'text-black/40'}`} />
          <h4 className="font-bold text-lg">Pay A La Carte</h4>
          <p className="text-sm font-medium text-black/60 mt-1">One-time card payment</p>

          <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center text-sm font-bold uppercase tracking-widest">
            <span className="text-black/40">Price</span>
            <span className="text-black">${cashPrice}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40">
            <ShieldCheck className="h-4 w-4" /> Secure checkout
          </div>
        </button>
      </div>

      {/* Inline top-up when credits are insufficient */}
      <AnimatePresence initial={false}>
        {allowCredits && method === 'credits' && !hasEnoughCredits && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-red-600 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Insufficient credits
                </span>
                <span>Short {shortfall}c</span>
              </div>
              <p className="text-xs font-medium text-red-900/70">
                Select a credit pack below, then click the confirm button to buy credits and complete your purchase in one step.
              </p>
              <CreditPackGrid
                compact
                mode="select"
                shortfall={shortfall}
                selectedPackId={selectedPack?._id || selectedPack?.id}
                onSelect={handlePackSelect}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
