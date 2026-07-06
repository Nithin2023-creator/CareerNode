const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');

exports.ensureUserMembership = async (userId) => {
  let membership = await UserMembership.findOne({ userId }).populate('planId');
  if (membership) return membership;

  const freePlan = await MembershipPlan.findOne({ tier: 'free', isActive: true });
  if (!freePlan) return null;

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 10);

  membership = await UserMembership.create({
    userId,
    planId: freePlan._id,
    status: 'active',
    renewsAt: nextYear,
  });

  return UserMembership.findById(membership._id).populate('planId');
};

exports.getUserPlan = async (userId) => {
  const membership = await exports.ensureUserMembership(userId);
  return membership?.planId || null;
};
