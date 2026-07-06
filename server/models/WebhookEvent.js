const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
