const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cfOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  orderType: {
    type: String,
    enum: ['wallet_topup', 'bundle', 'job_finder_checkout'],
    required: true,
  },
  referenceId: {
    type: String, // e.g. packId or bundleId
  },
  cartItems: [{
    type: mongoose.Schema.Types.Mixed, // For job_finder_checkout cart
  }],
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created',
  },
  fulfilledAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
