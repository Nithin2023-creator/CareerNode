const { verifyWebhookSignature } = require('./cashfreeClient');
const WebhookEvent = require('../models/WebhookEvent');
const PaymentOrder = require('../models/PaymentOrder');
const UserMembership = require('../models/UserMembership');
const MembershipPlan = require('../models/MembershipPlan');
const walletService = require('./walletService');
const subscriptionService = require('./subscriptionService');
const BundlePurchase = require('../models/BundlePurchase');
const Bundle = require('../models/Bundle');

async function processWebhook(signature, rawBody, timestamp, body) {
  // 1. Verify signature
  const isValid = verifyWebhookSignature(signature, rawBody, timestamp);
  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  // 2. Extract common webhook fields
  const eventId = body?.data?.event_id || body?.data?.event_time || String(Date.now()); // Fallbacks in case format varies
  const type = body?.type;

  if (!type) {
    throw new Error('Webhook missing type');
  }

  // 3. Idempotency check
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    console.log(`[Webhook] Event ${eventId} already processed, skipping.`);
    return { success: true, duplicate: true };
  }

  await WebhookEvent.create({ eventId, type });
  
  console.log(`[Webhook] Processing event ${type} (${eventId})`);

  try {
    // 4. Route by type
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
    // We do NOT delete the WebhookEvent if it failed permanently, but for transient errors we might want to.
    // For now, let Cashfree retry it later by throwing, which causes a 500 response (if we want them to retry).
    // Or we return 200 and log the error. We'll throw to let the controller return 500.
    await WebhookEvent.deleteOne({ eventId }); // delete so it can be retried
    throw error;
  }
}

async function handlePaymentSuccess(body) {
  const { order_id, payment_amount, payment_currency } = body.data.order || body.data.payment; // depends on actual webhook format, usually body.data.order
  const cfOrderId = order_id || body.data.order_id;
  
  const order = await PaymentOrder.findOne({ cfOrderId });
  if (!order) {
    console.warn(`[Webhook] Order ${cfOrderId} not found.`);
    return;
  }

  if (order.status === 'paid') {
    return;
  }

  order.status = 'paid';
  order.fulfilledAt = new Date();

  // Fulfill based on orderType
  if (order.orderType === 'wallet_topup') {
    // Pack purchase
    await walletService.addCredits(
      order.userId,
      // Need pack details. Ideally stored in referenceId
      // Let's assume amount matches pack or we just add something for now?
      // Wait, we need to know how many credits to add.
      // We should really store `creditsToAdd` in PaymentOrder or lookup the pack.
      // To keep it simple, I'll fetch the pack.
      0, // Will be fixed below
      `Wallet top-up (Order ${order.cfOrderId})`,
      'purchase'
    );
    // Actually, let's fix this inside wallet controller or here. 
    // We should probably fetch the pack. Let's do it right.
    const CreditPack = require('../models/CreditPack');
    const pack = await CreditPack.findById(order.referenceId);
    if (pack) {
      await walletService.addCredits(order.userId, pack.credits, `Wallet top-up (${pack.name})`, 'purchase');
    }
  } else if (order.orderType === 'bundle') {
    const bundle = await Bundle.findById(order.referenceId);
    if (bundle) {
      await BundlePurchase.create({
        userId: order.userId,
        bundleId: bundle._id,
      });
      // We also need to add bundle contents to user templates, etc., but BundlePurchase is what's used by API.
    }
  } else if (order.orderType === 'job_finder_checkout') {
    // cartItems has the list
    if (order.cartItems && order.cartItems.length > 0) {
      for (const item of order.cartItems) {
        // Here we just use the existing logic (simplified)
        // Subscription model
        const Subscription = require('../models/Subscription');
        
        // Ensure not already subscribed
        const existing = await Subscription.findOne({
          userId: order.userId,
          companyId: item.companyId || item.id,
          status: 'active'
        });

        if (!existing) {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          
          await Subscription.create({
            userId: order.userId,
            companyId: item.companyId || item.id,
            status: 'active',
            startDate: new Date(),
            endDate: endDate
          });
        }
      }
    }
  }

  await order.save();
  console.log(`[Webhook] Fulfilled one-time order ${cfOrderId}`);
}

async function handlePaymentFailed(body) {
  const cfOrderId = body.data?.order?.order_id || body.data?.order_id;
  const order = await PaymentOrder.findOne({ cfOrderId });
  if (order && order.status === 'created') {
    order.status = 'failed';
    await order.save();
    console.log(`[Webhook] Order ${cfOrderId} marked failed`);
  }
}

async function handleSubscriptionStatusChange(body) {
  const cfSubscriptionId = body.data?.subscription?.subscription_id;
  const status = body.data?.subscription?.subscription_status; // ACTIVE, CANCELLED, ON_HOLD

  if (!cfSubscriptionId || !status) return;

  const membership = await UserMembership.findOne({ cfSubscriptionId }).populate('planId');
  if (!membership) return;

  if (status === 'ACTIVE') {
    membership.status = 'active';
    const nextRenewal = new Date();
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    membership.renewsAt = nextRenewal;
    
    // First time activation bonus credits
    if (membership.planId.monthlyBonusCredits > 0) {
       await walletService.addCredits(
         membership.userId,
         membership.planId.monthlyBonusCredits,
         `Bonus for ${membership.planId.name}`,
         'membership'
       );
    }
    
  } else if (status === 'CANCELLED' || status === 'COMPLETED') {
    membership.status = 'cancelled';
  } else if (status === 'ON_HOLD') {
    membership.status = 'past_due';
  }

  await membership.save();
  console.log(`[Webhook] Updated subscription ${cfSubscriptionId} status to ${status}`);
}

async function handleSubscriptionPaymentSuccess(body) {
  const cfSubscriptionId = body.data?.subscription?.subscription_id;
  const paymentId = body.data?.payment?.cf_payment_id;

  if (!cfSubscriptionId || !paymentId) return;

  const membership = await UserMembership.findOne({ cfSubscriptionId }).populate('planId');
  if (!membership) return;

  // Idempotency for this specific payment
  if (membership.lastPaymentId === paymentId) {
    return;
  }
  
  membership.lastPaymentId = paymentId;
  
  // Extend renewal
  const nextRenewal = new Date(membership.renewsAt || Date.now());
  nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  membership.renewsAt = nextRenewal;
  membership.status = 'active'; // clear past_due if it was

  // Add monthly bonus
  if (membership.planId.monthlyBonusCredits > 0) {
     await walletService.addCredits(
       membership.userId,
       membership.planId.monthlyBonusCredits,
       `Monthly ${membership.planId.name} renewal`,
       'membership'
     );
  }

  await membership.save();
  console.log(`[Webhook] Processed recurring payment ${paymentId} for subscription ${cfSubscriptionId}`);
}

async function handleSubscriptionPaymentFailed(body) {
  const cfSubscriptionId = body.data?.subscription?.subscription_id;
  if (!cfSubscriptionId) return;
  
  const membership = await UserMembership.findOne({ cfSubscriptionId });
  if (membership) {
    membership.status = 'past_due';
    await membership.save();
    console.log(`[Webhook] Marked subscription ${cfSubscriptionId} as past_due due to payment failure`);
  }
}

module.exports = {
  processWebhook
};
