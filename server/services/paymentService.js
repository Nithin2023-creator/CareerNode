const { Cashfree } = require('./cashfreeClient');
const PaymentOrder = require('../models/PaymentOrder');
const MembershipPlan = require('../models/MembershipPlan');
const axios = require('axios');

const getCashfreeHeaders = () => {
  return {
    'x-client-id': process.env.CASHFREE_APP_ID,
    'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    'x-api-version': process.env.CASHFREE_API_VERSION,
    'Content-Type': 'application/json',
  };
};

const getBaseUrl = () => {
  return process.env.CASHFREE_ENV === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
};

/**
 * Creates a one-time payment order in Cashfree.
 */
async function createOrder({ userId, amount, orderType, referenceId, cartItems, customerDetails }) {
  const cfOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const order = await PaymentOrder.create({
    userId,
    cfOrderId,
    orderType,
    referenceId,
    cartItems,
    amount,
  });

  const request = {
    order_amount: amount,
    order_currency: 'USD',
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
    }
  };

  try {
    const response = await Cashfree.PGCreateOrder(request);
    return { orderId: order._id, paymentSessionId: response.data.payment_session_id };
  } catch (error) {
    console.error('Cashfree order creation error:', error.response?.data || error.message);
    throw new Error('Failed to create payment order');
  }
}

/**
 * Creates a recurring subscription in Cashfree.
 */
async function createSubscription({ userId, plan, customerDetails }) {
  // Ensure the plan exists in Cashfree
  if (!plan.cfPlanId) {
    const cfPlanId = `plan_${plan._id}`;
    const planRequest = {
      plan_id: cfPlanId,
      plan_name: plan.name,
      plan_type: 'PERIODIC',
      plan_currency: 'USD',
      plan_recurring_amount: plan.monthlyPrice,
      plan_interval_type: 'MONTH',
      plan_intervals: 1,
    };

    try {
      await axios.post(`${getBaseUrl()}/plans`, planRequest, { headers: getCashfreeHeaders() });
      plan.cfPlanId = cfPlanId;
      await plan.save();
    } catch (error) {
      if (error.response?.data?.type !== 'duplicate_plan') {
        console.error('Cashfree create plan error:', error.response?.data || error.message);
        throw new Error('Failed to configure membership plan with payment provider');
      }
      // If it exists, just save it
      plan.cfPlanId = cfPlanId;
      await plan.save();
    }
  }

  const subId = `sub_${userId}_${Date.now()}`;
  
  const subRequest = {
    subscription_id: subId,
    plan_id: plan.cfPlanId,
    customer_details: {
      customer_name: customerDetails?.name || 'Customer',
      customer_email: customerDetails?.email || 'test@example.com',
      customer_phone: customerDetails?.phone || '9999999999'
    },
    subscription_meta: {
      return_url: `${process.env.CLIENT_ORIGIN}/dashboard/billing?sub_id={subscription_id}`
    }
  };

  try {
    const response = await axios.post(`${getBaseUrl()}/subscriptions`, subRequest, { headers: getCashfreeHeaders() });
    
    // authorization_details might be provided depending on Cashfree API response structure
    const authSessionId = response.data.authorization_details?.authorization_link || response.data.subscription_id; 
    
    return { cfSubscriptionId: subId, authSessionId: response.data.payment_session_id || authSessionId };
  } catch (error) {
    console.error('Cashfree create subscription error:', error.response?.data || error.message);
    throw new Error('Failed to create subscription');
  }
}

/**
 * Cancels a recurring subscription in Cashfree.
 */
async function cancelSubscription(cfSubscriptionId) {
  try {
    await axios.post(`${getBaseUrl()}/subscriptions/${cfSubscriptionId}/cancel`, {}, { headers: getCashfreeHeaders() });
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
};
