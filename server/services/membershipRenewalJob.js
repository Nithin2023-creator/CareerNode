const UserMembership = require('../models/UserMembership');
const MembershipPlan = require('../models/MembershipPlan');

/**
 * Cashfree handles automatic renewals and billing.
 * This job acts as a reconciliation safety net:
 * 1. It downgrades users to the Free plan if they cancelled (cancelAtPeriodEnd) and their period is over.
 * 2. It marks memberships as past_due if their renewal date passed and Cashfree hasn't sent a successful payment webhook within a grace period.
 */
async function processRenewals() {
  try {
    const now = new Date();
    // 2-day grace period for webhooks to arrive
    const gracePeriodEnd = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); 

    // Find active memberships that have passed their renewal date
    const dueMemberships = await UserMembership.find({
      status: 'active',
      renewsAt: { $lte: now }
    }).populate('planId');

    for (const membership of dueMemberships) {
      if (membership.cancelAtPeriodEnd) {
        // Downgrade to Free plan
        const freePlan = await MembershipPlan.findOne({ tier: 'free' });
        if (freePlan) {
          membership.planId = freePlan._id;
          membership.cancelAtPeriodEnd = false;
          membership.cfSubscriptionId = null;
          // Set to a far future date for free plan
          const nextYear = new Date(now);
          nextYear.setFullYear(nextYear.getFullYear() + 10);
          membership.renewsAt = nextYear; 
          await membership.save();
          console.log(`[Renewal Job] Downgraded user ${membership.userId} to Free plan after cancellation period.`);
        }
      } else if (membership.renewsAt <= gracePeriodEnd && membership.planId.tier !== 'free') {
        // Renewal webhook hasn't arrived after grace period
        membership.status = 'past_due';
        await membership.save();
        console.log(`[Renewal Job] Marked user ${membership.userId}'s subscription as past_due (Grace period expired).`);
      }
    }
  } catch (error) {
    console.error('[Renewal Job] Error processing renewals:', error);
  }
}

function startMembershipRenewalJob() {
  // Run once on startup, then every 6 hours
  processRenewals();
  setInterval(processRenewals, 6 * 60 * 60 * 1000); 
  console.log('[Renewal Job] Started membership reconciliation job');
}

module.exports = {
  processRenewals,
  startMembershipRenewalJob
};
