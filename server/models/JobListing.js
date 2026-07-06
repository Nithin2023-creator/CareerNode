const mongoose = require('mongoose');

const jobListingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  url: { type: String, required: true },
  location: { type: String, default: 'Not specified' },
  experienceLevel: {
    type: String,
    enum: ['Entry-Level', 'Mid-Level', 'Senior', 'Staff/Principal', 'Manager/Director'],
    default: 'Mid-Level',
  },
  tags: [{ type: String }],
  sourceType: { type: String, enum: ['ats', 'generic'], default: 'generic' },
  atsProvider: { type: String, default: null },
  scrapedAt: { type: Date, default: Date.now },
});

// Prevent duplicate listings per company
jobListingSchema.index({ companyId: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('JobListing', jobListingSchema);
