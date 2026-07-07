import { walletApi } from './api';
import { openCashfreeCheckout, pollOrderStatus } from './cashfree';

/**
 * Creates a wallet top-up order, opens Cashfree checkout, and polls until paid.
 * Throws if payment fails or is cancelled.
 */
export async function purchaseCreditPack(pack) {
  const packId = pack._id || pack.id;
  const { orderId, paymentSessionId } = await walletApi.purchasePack(packId);
  await openCashfreeCheckout(paymentSessionId);
  const status = await pollOrderStatus((id) => walletApi.getOrderStatus(id), orderId);
  if (status !== 'paid') {
    throw new Error('Payment failed or was cancelled.');
  }
}

export const FALLBACK_PACKS = [
  { id: 'pack-starter', name: 'Starter', credits: 20, price: 9.99 },
  { id: 'pack-growth', name: 'Growth', credits: 60, price: 24.99, badge: 'BEST VALUE' },
  { id: 'pack-pro', name: 'Pro', credits: 150, price: 49.99 },
];

/** Cheapest pack whose credits cover the shortfall (sorted ascending by credits). */
export function pickPackForShortfall(packs, shortfall) {
  if (!packs?.length || shortfall <= 0) return packs?.[0] ?? null;
  const sorted = [...packs].sort((a, b) => a.credits - b.credits);
  return sorted.find((p) => p.credits >= shortfall) ?? sorted[sorted.length - 1];
}

/**
 * If balance is short, buys the selected pack via Cashfree, refreshes wallet,
 * and verifies the new balance covers creditCost. Returns the updated balance.
 */
export async function ensureCreditsForAction({ balance, creditCost, selectedPack, refreshWallet }) {
  if (balance >= creditCost) return balance;
  if (!selectedPack) {
    throw new Error('Please select a credit pack to continue.');
  }
  await purchaseCreditPack(selectedPack);
  const wallet = await refreshWallet();
  const newBalance = wallet?.balance ?? 0;
  if (newBalance < creditCost) {
    throw new Error('Selected pack does not cover the cost. Please choose a larger pack.');
  }
  return newBalance;
}

/** Label for the unified confirm button when credits path may require a top-up. */
export function getCreditsConfirmLabel({ hasEnoughCredits, selectedPack, creditCost }) {
  if (hasEnoughCredits) return 'CONFIRM & PAY';
  if (selectedPack) {
    return `BUY ${selectedPack.credits}C & PAY (${creditCost}C)`;
  }
  return 'SELECT A PACK';
}
