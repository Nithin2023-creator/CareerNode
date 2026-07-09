const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logoUrl: { type: String, default: '' },
  category: { type: String, required: true },
  tier: { type: String, enum: ['standard', 'premium'], default: 'standard' },
  description: { type: String, default: '' },
  careersPageUrl: { type: String, required: true, trim: true },
  creditCost: { type: Number, required: true, default: 10 },
  alaCartePrice: { type: Number, required: true, default: 14.99 },
  openRoles: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastScrapedAt: { type: Date, default: null },
  lastScrapeStatus: { type: String, enum: ['idle', 'running', 'success', 'failed'], default: 'idle' },
  lastScrapeError: { type: String, default: null },
  lastScrapeStats: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
