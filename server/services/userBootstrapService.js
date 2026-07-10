const Wallet = require('../models/Wallet');
const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');
const walletService = require('./walletService');
const { SIGNUP_BONUS_CREDITS } = require('../config/freemium');

exports.bootstrapNewUser = async (userId) => {
  // Initialize empty wallet
  await Wallet.create({
    userId,
    balance: 0,
    transactions: []
  });

  // Grant welcome credits
  await walletService.grantCredits(
    userId,
    SIGNUP_BONUS_CREDITS,
    `Welcome bonus — ${SIGNUP_BONUS_CREDITS} free credits`,
    'signup'
  );

  // Grant free membership
  const freePlan = await MembershipPlan.findOne({ tier: 'free' });
  if (freePlan) {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 10);
    await UserMembership.create({
      userId: userId,
      planId: freePlan._id,
      status: 'active',
      renewsAt: nextYear,
    });
  }

  return { welcomeCredits: SIGNUP_BONUS_CREDITS };
};
