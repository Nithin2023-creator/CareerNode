const { verifyWebhookSignature } = require('./cashfreeClient');
const WebhookEvent = require('../models/WebhookEvent');
const PaymentOrder = require('../models/PaymentOrder');
const UserMembership = require('../models/UserMembership');
const walletService = require('./walletService');
const BundlePurchase = require('../models/BundlePurchase');
const Bundle = require('../models/Bundle');
const CreditPack = require('../models/CreditPack');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const GmailConnection = require('../models/GmailConnection');
const { campaignService } = require('./campaignService');

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function buildEventId(body) {
  const type = body?.type || 'unknown';
  const orderId = body?.data?.order?.order_id;
  const subId = body?.data?.subscription?.subscription_id;
  const paymentId = body?.data?.payment?.cf_payment_id;
  const eventTime = body?.data?.event_time;
  return body?.data?.event_id || `${type}_${orderId || subId || ''}_${paymentId || eventTime || Date.now()}`;
}

async function processWebhook(signature, rawBody, timestamp, body) {
  const isValid = verifyWebhookSignature(signature, rawBody, timestamp);
  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  const type = body?.type;
  if (!type) {
    throw new Error('Webhook missing type');
  }

  const eventId = buildEventId(body);
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    console.log(`[Webhook] Event ${eventId} already processed, skipping.`);
    return { success: true, duplicate: true };
  }

  await WebhookEvent.create({ eventId, type });
  console.log(`[Webhook] Processing event ${type} (${eventId})`);

  try {
    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      await handlePaymentSuccess(body);
    } else if (type === 'PAYMENT_FAILED_WEBHOOK') {
      await handlePaymentFailed(body);
    } else if (type === 'SUBSCRIPTION_STATUS_CHANGE_WEBHOOK') {
      await handleSubscriptionStatusChange(body);
    } else if (type === 'SUBSCRIPTION_PAYMENT_SUCCESS_WEBHOOK') {
      await handleSubscriptionPaymentSuccess(body);
    } else if (type === 'SUBSCRIPTION_PAYMENT_FAILED_WEBHOOK') {
      await handleSubscriptionPaymentFailed(body);
    } else {
      console.log(`[Webhook] Unhandled event type: ${type}`);
    }

    return { success: true };
  } catch (error) {
    await WebhookEvent.deleteOne({ eventId });
    throw error;
  }
}

async function handlePaymentSuccess(body) {
  const cfOrderId = body?.data?.order?.order_id || body?.data?.payment?.order_id;
  if (!cfOrderId) return;

  const order = await PaymentOrder.findOne({ cfOrderId });
  if (!order) {
    console.warn(`[Webhook] Order ${cfOrderId} not found.`);
    return;
  }

  if (order.status === 'paid') return;

  if (order.orderType === 'wallet_topup') {
    const pack = await CreditPack.findById(order.referenceId);
    if (pack) {
      await walletService.addCredits(
        order.userId,
        pack.credits,
        `Wallet top-up (${pack.name})`,
        'job-finder'
      );
    }
  } else if (order.orderType === 'bundle') {
    const bundle = await Bundle.findById(order.referenceId);
    if (bundle) {
      const existing = await BundlePurchase.findOne({ userId: order.userId, bundleId: bundle._id });
      if (!existing) {
        await BundlePurchase.create({
          userId: order.userId,
          bundleId: bundle._id,
          paymentMethod: 'alacarte',
          pricePaid: order.amount,
        });
      }
    }
  } else if (order.orderType === 'credit_action') {
    // A la carte payment for a flat-priced action (e.g. resume tailor/export).
    // Nothing to grant here: the action itself is redeemed synchronously when
    // the frontend calls the action endpoint with the paid order id. We only
    // mark the order paid/fulfilled below so it can be consumed once.
  } else if (order.orderType === 'job_finder_checkout' && order.cartItems?.length) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ONE_MONTH_MS);

    for (const item of order.cartItems) {
      const companyId = item.companyId || item.id || item._id;
      if (!companyId) continue;

      const existing = await Subscription.findOne({
        userId: order.userId,
        companyId,
        status: { $in: ['active', 'expiring'] },
      });
      if (existing) continue;

      let pricePaid = item.pricePaid;
      if (pricePaid == null) {
        const company = await Company.findById(companyId).lean();
        pricePaid = company?.alaCartePrice || 0;
      }

      await Subscription.create({
        userId: order.userId,
        companyId,
        status: 'active',
        paymentMethod: 'alacarte',
        pricePaid,
        purchasedAt: now,
        expiresAt,
      });
    }
  } else if (order.orderType === 'cold_mailer_send' && order.cartItems?.length) {
    // Process the cold mailer send upfront payment
    const { batchSize } = order.cartItems[0] || {};
    if (batchSize) {
      const connection = await GmailConnection.findOne({ userId: order.userId, status: 'active' });
      if (connection) {
        connection.sentToday = (connection.sentToday || 0) + batchSize;
        connection.sentTodayDate = new Date();
        await connection.save();
      }
      
      const campaignId = order.referenceId;
      if (campaignId) {
        // Find campaign to see if it's draft (needs start) or paused/stopped (needs resume)
        const Campaign = require('../models/Campaign');
        const campaign = await Campaign.findOne({ _id: campaignId, userId: order.userId });
        if (campaign) {
          if (campaign.status === 'Draft') {
            await campaignService.startCampaign(order.userId, campaignId, batchSize);
          } else {
            await campaignService.resumeCampaign(order.userId, campaignId, undefined, batchSize);
          }
        }
      }
    }
  }

  order.status = 'paid';
  order.fulfilledAt = new Date();
  await order.save();
  console.log(`[Webhook] Fulfilled one-time order ${cfOrderId}`);
}

async function handlePaymentFailed(body) {
  const cfOrderId = body?.data?.order?.order_id || body?.data?.payment?.order_id;
  if (!cfOrderId) return;

  const order = await PaymentOrder.findOne({ cfOrderId });
  if (order && order.status === 'created') {
    order.status = 'failed';
    await order.save();
    console.log(`[Webhook] Order ${cfOrderId} marked failed`);
  }
}

async function handleSubscriptionStatusChange(body) {
  const cfSubscriptionId = body?.data?.subscription?.subscription_id;
  const status = body?.data?.subscription?.subscription_status;

  if (!cfSubscriptionId || !status) return;

  const membership = await UserMembership.findOne({ cfSubscriptionId }).populate('planId');
  if (!membership) return;

  if (status === 'ACTIVE') {
    if (membership.pendingPlanId) {
      membership.planId = membership.pendingPlanId;
      membership.pendingPlanId = null;
    }
    membership.status = 'active';
    membership.cancelAtPeriodEnd = false;
    const nextRenewal = new Date();
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    membership.renewsAt = nextRenewal;
  } else if (status === 'CANCELLED' || status === 'COMPLETED') {
    membership.status = 'cancelled';
    membership.cfSubscriptionId = null;
    membership.pendingPlanId = null;
  } else if (status === 'ON_HOLD') {
    membership.status = 'past_due';
  }

  await membership.save();
  console.log(`[Webhook] Updated subscription ${cfSubscriptionId} status to ${status}`);
}

async function handleSubscriptionPaymentSuccess(body) {
  const cfSubscriptionId = body?.data?.subscription?.subscription_id;
  const paymentId = body?.data?.payment?.cf_payment_id;

  if (!cfSubscriptionId || !paymentId) return;

  const membership = await UserMembership.findOne({ cfSubscriptionId }).populate('planId');
  if (!membership) return;

  if (membership.lastPaymentId === paymentId) return;

  membership.lastPaymentId = paymentId;
  membership.status = 'active';

  const nextRenewal = new Date(membership.renewsAt || Date.now());
  nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  membership.renewsAt = nextRenewal;

  if (membership.planId?.monthlyBonusCredits > 0) {
    await walletService.addCredits(
      membership.userId,
      membership.planId.monthlyBonusCredits,
      `Monthly ${membership.planId.name} bonus credits`,
      'membership'
    );
  }

  await membership.save();
  console.log(`[Webhook] Processed recurring payment ${paymentId} for subscription ${cfSubscriptionId}`);
}

async function handleSubscriptionPaymentFailed(body) {
  const cfSubscriptionId = body?.data?.subscription?.subscription_id;
  if (!cfSubscriptionId) return;

  const membership = await UserMembership.findOne({ cfSubscriptionId });
  if (membership) {
    membership.status = 'past_due';
    await membership.save();
    console.log(`[Webhook] Marked subscription ${cfSubscriptionId} as past_due`);
  }
}

module.exports = {
  processWebhook,
};
