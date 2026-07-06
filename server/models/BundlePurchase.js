const mongoose = require('mongoose');

const bundlePurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['credits', 'alacarte'],
    required: true,
  },
  pricePaid: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

bundlePurchaseSchema.index({ userId: 1, bundleId: 1 }, { unique: true });

module.exports = mongoose.model('BundlePurchase', bundlePurchaseSchema);
