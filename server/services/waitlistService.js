const WaitlistEntry = require('../models/WaitlistEntry');
const emailValidator = require('./emailValidator');

const waitlistService = {
  async joinWaitlist({ email, tool = 'automations', wantsInsider = false }) {
    if (!email) {
      const err = new Error('Email is required.');
      err.statusCode = 400;
      throw err;
    }

    const { valid, reason } = await emailValidator.verifyEmail(email);
    if (!valid) {
      const err = new Error(reason || 'Invalid email address.');
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Idempotent upsert
    const entry = await WaitlistEntry.findOneAndUpdate(
      { email: normalizedEmail, tool },
      { $set: { wantsInsider } },
      { upsert: true, new: true }
    );

    return entry;
  },

  async getWaitlistCount(tool = 'automations') {
    const count = await WaitlistEntry.countDocuments({ tool });
    return count;
  },
};

module.exports = waitlistService;
