const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expiring', 'expired', 'cancelled'],
    default: 'active',
  },
  paymentMethod: {
    type: String,
    enum: ['credits', 'alacarte'],
    required: true,
  },
  pricePaid: { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  newMatchesCount: { type: Number, default: 0 },
  lastScanAt: { type: Date, default: null },
  bookmarkedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobListing' }],
}, { timestamps: true });

// One active subscription per user per company
subscriptionSchema.index({ userId: 1, companyId: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
