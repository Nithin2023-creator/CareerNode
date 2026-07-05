const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  region: { type: String },
  description: { type: String },
  sampleTitles: [{ type: String }],
  contactCount: { type: Number, required: true },
  creditCost: { type: Number, required: true },
  alaCartePrice: { type: Number, required: true },
  lastVerifiedAt: { type: Date },
  recipients: [{
    companyName: String,
    hrName: String,
    email: { type: String, required: true },
    role: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bundle', bundleSchema);
