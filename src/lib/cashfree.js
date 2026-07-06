import { load } from '@cashfreepayments/cashfree-js';

let cashfreeInstance = null;

export const getCashfree = async () => {
  if (!cashfreeInstance) {
    cashfreeInstance = await load({
      mode: import.meta.env.VITE_CASHFREE_MODE || 'sandbox', // or 'production'
    });
  }
  return cashfreeInstance;
};

export const openCashfreeCheckout = async (paymentSessionId) => {
  const cf = await getCashfree();
  return cf.checkout({
    paymentSessionId,
    redirectTarget: '_modal', // Opens the Drop-in UI in a modal
  });
};
