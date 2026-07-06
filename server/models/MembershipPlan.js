const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    enum: ['free', 'pro', 'elite'],
    required: true,
    unique: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  monthlyBonusCredits: {
    type: Number,
    required: true,
    min: 0,
  },
  alaCarteDiscountPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  maxActiveSubscriptions: {
    type: Number,
    default: null, // null = unlimited
  },
  perks: {
    type: [String],
    default: [],
  },
  badge: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cfPlanId: {
    type: String, // Cache Cashfree plan reference
  }
}, { timestamps: true });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
