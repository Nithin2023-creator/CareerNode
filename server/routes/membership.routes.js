const express = require('express');
const router = express.Router();
const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');
const { requireAuth } = require('../middleware/auth.middleware');
const paymentService = require('../services/paymentService');
const walletService = require('../services/walletService');
const membershipService = require('../services/membershipService');
const httpError = require('http-errors');

// GET /plans - Public list of active plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort({ monthlyPrice: 1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// GET /me - Current user's plan
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const membership = await membershipService.ensureUserMembership(req.user._id);
    if (!membership) {
      return res.status(404).json({ error: 'No membership plans configured' });
    }
    res.json(membership);
  } catch (error) {
    next(error);
  }
});

// POST /subscribe - Subscribe to a plan
router.post('/subscribe', requireAuth, async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = await MembershipPlan.findById(planId);
    
    if (!plan || !plan.isActive) {
      throw httpError(404, 'Plan not found or inactive');
    }

    let membership = await UserMembership.findOne({ userId: req.user._id });
    if (!membership) {
      await membershipService.ensureUserMembership(req.user._id);
      membership = await UserMembership.findOne({ userId: req.user._id });
    }
    if (!membership) {
      throw httpError(400, 'User membership record missing');
    }

    if (plan.tier !== 'free') {
      // Switching between paid tiers (or retrying while pending) must cancel any
      // existing mandate first, otherwise the old one stays active in Cashfree
      // and keeps auto-charging the customer alongside the new one.
      if (membership.cfSubscriptionId) {
        await paymentService.cancelSubscription(membership.cfSubscriptionId);
        membership.cfSubscriptionId = null;
      }

      const { cfSubscriptionId, paymentSessionId, authorizationLink } =
        await paymentService.createSubscription({
          userId: req.user._id,
          plan,
          customerDetails: {
            name: req.user.name,
            email: req.user.email,
          },
        });

      membership.cfSubscriptionId = cfSubscriptionId;
      membership.pendingPlanId = plan._id;
      membership.status = 'pending_authorization';

      await membership.save();

      return res.json({ success: true, paymentSessionId, authorizationLink });
    } else {
      if (membership.cfSubscriptionId) {
        await paymentService.cancelSubscription(membership.cfSubscriptionId);
        membership.cfSubscriptionId = null;
      }
      
      membership.planId = plan._id;
      membership.status = 'active';
      membership.cancelAtPeriodEnd = false;
      const nextRenewal = new Date();
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 10);
      membership.renewsAt = nextRenewal;
      
      await membership.save();
      return res.json({ success: true, membership });
    }
  } catch (error) {
    next(error);
  }
});

// POST /cancel - Cancel auto-renewal
router.post('/cancel', requireAuth, async (req, res, next) => {
  try {
    const membership = await UserMembership.findOne({ userId: req.user._id }).populate('planId');
    if (!membership) {
      throw httpError(404, 'Membership not found');
    }

    if (membership.planId.tier === 'free') {
      throw httpError(400, 'Cannot cancel a free plan');
    }

    membership.cancelAtPeriodEnd = true;
    if (membership.cfSubscriptionId) {
      await paymentService.cancelSubscription(membership.cfSubscriptionId);
    }
    await membership.save();

    res.json({ success: true, membership });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
