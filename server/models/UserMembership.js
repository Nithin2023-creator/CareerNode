const mongoose = require('mongoose');

const userMembershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'pending_authorization'],
    default: 'active',
  },
  renewsAt: {
    type: Date,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  cfSubscriptionId: {
    type: String,
    default: null,
    index: true,
  },
  lastPaymentId: {
    type: String, // For webhook idempotency
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('UserMembership', userMembershipSchema);
