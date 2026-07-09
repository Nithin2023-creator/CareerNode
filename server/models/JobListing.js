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
  employmentType: { type: String, default: 'Not specified' },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  sourceType: { type: String, enum: ['ats', 'generic'], default: 'generic' },
  atsProvider: { type: String, default: null },
  scrapedAt: { type: Date, default: Date.now },
});

// Exact-match filtering by purchasing users queries on these fields directly.
jobListingSchema.index({ companyId: 1, location: 1, experienceLevel: 1 });

// Prevent duplicate listings per company
jobListingSchema.index({ companyId: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('JobListing', jobListingSchema);
