const mongoose = require('mongoose');

const waitlistEntrySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  tool: {
    type: String,
    default: 'automations',
  },
  wantsInsider: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

waitlistEntrySchema.index({ email: 1, tool: 1 }, { unique: true });

module.exports = mongoose.model('WaitlistEntry', waitlistEntrySchema);
