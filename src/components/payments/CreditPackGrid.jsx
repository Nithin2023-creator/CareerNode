import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { walletApi } from '../../lib/api';
import { withMockFallback } from '../../lib/apiHelpers';
import { useToast } from '../../lib/toast';
import {
  FALLBACK_PACKS,
  purchaseCreditPack,
  pickPackForShortfall,
} from '../../lib/creditPacks';

/**
 * Reusable credit-pack grid.
 *
 * mode="instant" (default) — each pack has BUY NOW; used on WalletPage.
 * mode="select" — cards are selectable; parent confirms via a single outer button.
 */
export default function CreditPackGrid({
  onPurchased,
  compact = false,
  mode = 'instant',
  shortfall = 0,
  selectedPackId = null,
  onSelect,
}) {
  const toast = useToast();
  const [packs, setPacks] = useState(FALLBACK_PACKS);
  const [processingPackId, setProcessingPackId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await withMockFallback(walletApi.getPacks(), FALLBACK_PACKS);
      if (active && Array.isArray(data) && data.length) setPacks(data);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Auto-select cheapest pack that covers shortfall when in select mode.
  useEffect(() => {
    if (mode !== 'select' || !packs.length || !onSelect) return;
    if (selectedPackId) return;
    const defaultPack = pickPackForShortfall(packs, shortfall);
    if (defaultPack) onSelect(defaultPack);
  }, [mode, packs, shortfall, selectedPackId, onSelect]);

  const handleInstantPurchase = async (pack) => {
    const packId = pack._id || pack.id;
    setProcessingPackId(packId);
    try {
      await purchaseCreditPack(pack);
      toast.success(`Successfully added ${pack.credits} credits to your wallet.`);
      if (onPurchased) await onPurchased(pack);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to initialize checkout. Please try again.');
    } finally {
      setProcessingPackId(null);
    }
  };

  const isSelectMode = mode === 'select';

  return (
    <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-3 gap-3' : 'md:grid-cols-3 gap-6'}`}>
      {packs.map((pack) => {
        const packId = pack._id || pack.id;
        const isProcessing = processingPackId === packId;
        const isSelected =
          isSelectMode && (selectedPackId === packId || selectedPackId === pack.id);

        const cardClasses = `bento-card bg-white relative flex flex-col items-center text-center border-2 transition-all ${
          compact ? 'p-4' : 'p-8'
        } ${
          isSelectMode
            ? isSelected
              ? 'border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/5 ring-2 ring-[var(--color-accent-blue)]/20 cursor-pointer'
              : 'border-black/10 hover:border-black/30 cursor-pointer'
            : pack.badge
              ? 'border-[var(--color-accent-yellow)] shadow-[var(--shadow-lift)] hover:-translate-y-1'
              : 'border-black/5 hover:shadow-[var(--shadow-soft)] hover:border-black/20 hover:-translate-y-1'
        }`;

        const inner = (
          <>
            {pack.badge && (
              <div className="absolute -top-3 px-4 py-1 bg-[var(--color-accent-yellow)] text-black text-[10px] font-bold uppercase tracking-widest rounded-full border border-black/10">
                {pack.badge}
              </div>
            )}

            {isSelectMode && isSelected && (
              <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[var(--color-accent-blue)] flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            )}

            <h3 className={`font-display font-bold uppercase ${compact ? 'text-lg mb-1' : 'text-2xl mb-2'}`}>
              {pack.name}
            </h3>
            <div className={`font-display font-bold flex items-center gap-1 ${compact ? 'text-3xl my-2' : 'text-5xl my-4'}`}>
              {pack.credits}
              <span className={`text-black/40 ${compact ? 'text-lg' : 'text-2xl'}`}>c</span>
            </div>
            <p className={`font-bold text-black/50 ${compact ? 'text-sm mb-4' : 'text-xl mb-8'}`}>${pack.price}</p>

            {!isSelectMode && (
              <button
                onClick={() => handleInstantPurchase(pack)}
                disabled={isProcessing}
                className={`w-full pill-btn flex items-center justify-center gap-2 ${compact ? '!py-2 text-xs' : ''} ${
                  pack.badge
                    ? 'bg-black text-[var(--color-accent-yellow)] hover:bg-[var(--color-accent-yellow)] hover:text-black'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
              >
                {isProcessing ? (
                  <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <>BUY NOW</>
                )}
              </button>
            )}

            {isSelectMode && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                {isSelected ? 'Selected' : 'Tap to select'}
              </p>
            )}
          </>
        );

        if (isSelectMode) {
          return (
            <button
              key={packId}
              type="button"
              onClick={() => onSelect?.(pack)}
              className={`${cardClasses} text-left w-full`}
            >
              {inner}
            </button>
          );
        }

        return (
          <div key={packId} className={cardClasses}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
