import { load } from '@cashfreepayments/cashfree-js';

let cashfreeInstance = null;

export const getCashfree = async () => {
  if (!cashfreeInstance) {
    cashfreeInstance = await load({
      mode: import.meta.env.VITE_CASHFREE_MODE || 'sandbox',
    });
  }
  return cashfreeInstance;
};

export const openCashfreeCheckout = async (paymentSessionId) => {
  if (!paymentSessionId) {
    throw new Error('Missing payment session');
  }
  const cf = await getCashfree();
  return cf.checkout({
    paymentSessionId,
    redirectTarget: '_modal',
  });
};

/** Subscription mandates may return an authorization URL instead of a payment session. */
export const openSubscriptionAuthorization = async ({ paymentSessionId, authorizationLink }) => {
  if (paymentSessionId) {
    return openCashfreeCheckout(paymentSessionId);
  }
  if (authorizationLink) {
    window.open(authorizationLink, '_blank', 'noopener,noreferrer');
    return { redirected: true };
  }
  throw new Error('No authorization method returned from payment provider');
};

export const pollOrderStatus = async (getStatus, orderId, { maxRetries = 15, intervalMs = 2000 } = {}) => {
  let status = 'created';
  let retries = 0;
  while (status === 'created' && retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const res = await getStatus(orderId);
    status = res.status;
    retries++;
  }
  return status;
};

export const pollMembershipActive = async (getMe, { maxRetries = 15, intervalMs = 2000 } = {}) => {
  let retries = 0;
  while (retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const membership = await getMe();
    if (membership?.status === 'active' && !membership?.pendingPlanId) {
      return membership;
    }
    retries++;
  }
  return null;
};
