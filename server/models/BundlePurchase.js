const mongoose = require('mongoose');

const bundlePurchaseSchema = new mongoose.Schema({
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

// Since there is no user model, we just record purchases globally for the single tenant.
module.exports = mongoose.model('BundlePurchase', bundlePurchaseSchema);
