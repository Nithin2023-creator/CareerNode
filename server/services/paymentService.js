const { Cashfree } = require('./cashfreeClient');
const PaymentOrder = require('../models/PaymentOrder');
const axios = require('axios');

/** Catalog prices are already in INR; just round to 2 decimals for Cashfree. */
const toInr = (amount) => Math.round(Number(amount) * 100) / 100;

const getCashfreeHeaders = () => ({
  'x-client-id': process.env.CASHFREE_APP_ID,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY,
  'x-api-version': process.env.CASHFREE_API_VERSION || '2025-01-01',
  'Content-Type': 'application/json',
});

const getBaseUrl = () =>
  process.env.CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

function requirePaymentEnv() {
  const missing = [];
  if (!process.env.CLIENT_ORIGIN) missing.push('CLIENT_ORIGIN');
  if (!process.env.SERVER_PUBLIC_URL) missing.push('SERVER_PUBLIC_URL');
  if (!process.env.CASHFREE_APP_ID) missing.push('CASHFREE_APP_ID');
  if (!process.env.CASHFREE_SECRET_KEY) missing.push('CASHFREE_SECRET_KEY');
  if (missing.length) {
    throw new Error(`Missing payment env vars: ${missing.join(', ')}`);
  }
}

/**
 * Creates a one-time payment order in Cashfree.
 * `amount` is the catalog price, already in INR.
 */
async function createOrder({ userId, amount, orderType, referenceId, cartItems, customerDetails }) {
  requirePaymentEnv();
  const cfOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const amountInr = toInr(amount);

  const order = await PaymentOrder.create({
    userId,
    cfOrderId,
    orderType,
    referenceId: referenceId?.toString?.() || referenceId,
    cartItems,
    amount: amountInr,
    currency: 'INR',
  });

  const request = {
    order_amount: amountInr,
    order_currency: 'INR',
    order_id: cfOrderId,
    customer_details: {
      customer_id: userId.toString(),
      customer_phone: customerDetails?.phone || '9999999999',
      customer_email: customerDetails?.email || 'test@example.com',
      customer_name: customerDetails?.name || 'Customer',
    },
    order_meta: {
      return_url: `${process.env.CLIENT_ORIGIN}/dashboard?order_id={order_id}`,
      notify_url: `${process.env.SERVER_PUBLIC_URL}/api/payments/webhook`,
    },
  };

  try {
    const response = await Cashfree.PGCreateOrder(request);
    console.log('[Cashfree] PGCreateOrder raw response status:', response.status);
    console.log('[Cashfree] PGCreateOrder response data:', JSON.stringify(response.data));
    const paymentSessionId = response.data?.payment_session_id;
    return { orderId: order._id, paymentSessionId };
  } catch (error) {
    await PaymentOrder.deleteOne({ _id: order._id });
    console.error('Cashfree order creation error:', error.response?.data || error.message);
    throw new Error('Failed to create payment order');
  }
}

/**
 * Creates a recurring subscription mandate in Cashfree.
 */
async function createSubscription({ userId, plan, customerDetails }) {
  if (!plan.cfPlanId) {
    const cfPlanId = `plan_${plan._id}`;
    const planRequest = {
      plan_id: cfPlanId,
      plan_name: plan.name,
      plan_type: 'PERIODIC',
      plan_currency: 'INR',
      plan_recurring_amount: toInr(plan.monthlyPrice),
      plan_max_amount: toInr(plan.monthlyPrice),
      plan_interval_type: 'MONTH',
      plan_intervals: 1,
    };

    try {
      await axios.post(`${getBaseUrl()}/plans`, planRequest, { headers: getCashfreeHeaders() });
    } catch (error) {
      const errType = error.response?.data?.type || error.response?.data?.code;
      if (errType !== 'duplicate_plan' && errType !== 'plan_already_exists') {
        console.error('Cashfree create plan error:', error.response?.data || error.message);
        throw new Error('Failed to configure membership plan with payment provider');
      }
    }
    plan.cfPlanId = cfPlanId;
    await plan.save();
  }

  const subId = `sub_${userId}_${Date.now()}`;

  const subRequest = {
    subscription_id: subId,
    plan_details: {
      plan_id: plan.cfPlanId,
    },
    customer_details: {
      customer_name: customerDetails?.name || 'Customer',
      customer_email: customerDetails?.email || 'test@example.com',
      customer_phone: customerDetails?.phone || '9999999999',
    },
    subscription_meta: {
      return_url: `${process.env.CLIENT_ORIGIN}/dashboard/billing?sub_id={subscription_id}`,
    },
  };

  try {
    const response = await axios.post(`${getBaseUrl()}/subscriptions`, subRequest, {
      headers: getCashfreeHeaders(),
    });

    const data = response.data;
    const paymentSessionId = data.payment_session_id || null;
    const authorizationLink = data.authorization_details?.authorization_link || null;

    return {
      cfSubscriptionId: subId,
      paymentSessionId,
      authorizationLink,
    };
  } catch (error) {
    console.error('Cashfree create subscription error:', error.response?.data || error.message);
    throw new Error('Failed to create subscription');
  }
}

async function cancelSubscription(cfSubscriptionId) {
  try {
    await axios.post(
      `${getBaseUrl()}/subscriptions/${cfSubscriptionId}/cancel`,
      {},
      { headers: getCashfreeHeaders() }
    );
    return { success: true };
  } catch (error) {
    console.error('Cashfree cancel subscription error:', error.response?.data || error.message);
    throw new Error('Failed to cancel subscription');
  }
}

module.exports = {
  createOrder,
  createSubscription,
  cancelSubscription,
  toInr,
};
