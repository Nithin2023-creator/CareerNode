const Campaign = require('../models/Campaign');
const GmailConnection = require('../models/GmailConnection');
const emailService = require('./emailService');
const emailValidator = require('./emailValidator');
const coldMailerPricing = require('../config/coldMailerPricing');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory registry of active send loops, used to signal pause/stop.
const activeCampaigns = new Map();

// Small helper so controllers can translate service errors into HTTP status codes.
const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const replaceTokens = (text, recipient) => {
  if (!text) return text;
  return text.replace(/{{(.*?)}}/g, (match, tokenName) => {
    const key = tokenName.trim();
    if (recipient[key] !== undefined && recipient[key] !== null && recipient[key] !== '') {
      return recipient[key];
    }
    if (recipient.dynamicData) {
      const val =
        typeof recipient.dynamicData.get === 'function'
          ? recipient.dynamicData.get(key)
          : recipient.dynamicData[key];
      if (val !== undefined) return val;
    }
    return match;
  });
};

const applyAbortState = async (campaign, campaignId, index, reason) => {
  campaign.lastProcessedIndex = Math.max(-1, index - 1);
  campaign.status = reason === 'paused' ? 'Paused' : 'Stopped';
  if (reason === 'paused') {
    campaign.pausedAt = new Date();
  } else {
    campaign.stoppedAt = new Date();
  }
  await campaign.save();
  activeCampaigns.delete(campaignId.toString());
};

/**
 * Runs the two-phase send pipeline (validate, then send) in the background.
 */
const processEmails = async (campaign, campaignId, connection, batchSize) => {
  let processedCount = 0;
  
  // Phase 1: validate all pending email addresses.
  for (let i = 0; i < campaign.recipients.length; i++) {
    if (batchSize !== undefined && processedCount >= batchSize) break;
    
    const signal = activeCampaigns.get(campaignId.toString());
    if (signal?.aborted) {
      await applyAbortState(campaign, campaignId, i, signal.reason);
      return;
    }

    const recipient = campaign.recipients[i];
    if (recipient.status !== 'Pending') continue;

    const validation = await emailValidator.verifyEmail(recipient.email);
    if (!validation.valid) {
      recipient.status = 'Invalid';
      recipient.failReason = validation.reason;
      await campaign.save();
    }
  }

  processedCount = 0;

  // Phase 2: send to the remaining pending (valid) recipients.
  for (let i = 0; i < campaign.recipients.length; i++) {
    if (batchSize !== undefined && processedCount >= batchSize) break;

    const signal = activeCampaigns.get(campaignId.toString());
    if (signal?.aborted) {
      await applyAbortState(campaign, campaignId, i, signal.reason);
      return;
    }

    const recipient = campaign.recipients[i];
    if (recipient.status !== 'Pending') continue;

    const personalizedSubject = replaceTokens(campaign.templateSubject, recipient);
    const personalizedBody = replaceTokens(campaign.templateBody, recipient);

    recipient.personalizedSubject = personalizedSubject;
    recipient.personalizedBody = personalizedBody;

    const result = await emailService.sendEmail({
      to: recipient.email,
      subject: personalizedSubject,
      body: personalizedBody,
      connection,
      resumeUrl: campaign.resumeUrl,
      coverLetterUrl: campaign.coverLetterUrl,
    });

    if (result.success) {
      recipient.status = 'Sent';
      recipient.sentAt = new Date();
      connection.lastUsedAt = new Date();
      await connection.save();
    } else {
      if (result.error && result.error.includes('invalid_grant')) {
        connection.status = 'revoked';
        await connection.save();
        recipient.status = 'Failed';
        recipient.failReason = 'Gmail connection revoked. Please reconnect.';
        campaign.lastProcessedIndex = i;
        await campaign.save();
        await applyAbortState(campaign, campaignId, i, 'revoked');
        return;
      }
      recipient.status = 'Failed';
      recipient.failReason = result.error;
    }

    processedCount++;
    campaign.lastProcessedIndex = i;
    await campaign.save();

    // Throttle 5s between sends to reduce spam flags, staying responsive to
    // pause/stop signals by polling every 100ms.
    const remainingPending = campaign.recipients.filter((r) => r.status === 'Pending').length;
    if (remainingPending > 0) {
      for (let s = 0; s < 50; s++) {
        const innerSignal = activeCampaigns.get(campaignId.toString());
        if (innerSignal?.aborted) break;
        await sleep(100);
      }
    }
  }

  const finalSignal = activeCampaigns.get(campaignId.toString());
  if (finalSignal?.aborted) {
    await applyAbortState(campaign, campaignId, campaign.recipients.length, finalSignal.reason);
    return;
  }

  const totalFailed = campaign.recipients.filter((r) => r.status === 'Failed').length;
  const totalInvalid = campaign.recipients.filter((r) => r.status === 'Invalid').length;
  const remainingPending = campaign.recipients.filter((r) => r.status === 'Pending').length;
  
  if (remainingPending > 0 && batchSize !== undefined && processedCount >= batchSize) {
    campaign.status = 'Paused'; // Auto-pause when batch is complete
    campaign.pausedAt = new Date();
  } else {
    campaign.status = totalFailed > 0 || totalInvalid > 0 ? 'Partially Failed' : 'Completed';
  }
  
  await campaign.save();
  activeCampaigns.delete(campaignId.toString());
};

const campaignService = {
  async getDailySendRemaining(userId) {
    const connection = await GmailConnection.findOne({ userId, status: 'active' });
    if (!connection) return 0;
    
    const now = new Date();
    // check if sentTodayDate is same day (in local/server time for simplicity)
    const isSameDay = connection.sentTodayDate && 
      connection.sentTodayDate.toDateString() === now.toDateString();
      
    if (!isSameDay) {
      connection.sentToday = 0;
      connection.sentTodayDate = now;
      await connection.save();
    }
    
    return Math.max(0, coldMailerPricing.dailySendLimit - (connection.sentToday || 0));
  },

  async listCampaigns(userId) {
    return Campaign.find({ userId }).sort({ createdAt: -1 });
  },

  async getCampaign(userId, id) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    return campaign;
  },

  async getCampaignStatus(userId, id) {
    const campaign = await Campaign.findOne({ _id: id, userId }).select('status recipients');
    if (!campaign) throw httpError(404, 'Campaign not found');
    return { status: campaign.status, recipients: campaign.recipients };
  },

  async createCampaign({ userId, title, templateSubject, templateBody, recipients, resumeUrl, coverLetterUrl }) {
    let parsedRecipients = [];
    if (typeof recipients === 'string') {
      parsedRecipients = JSON.parse(recipients);
    } else if (Array.isArray(recipients)) {
      parsedRecipients = recipients;
    }

    parsedRecipients = parsedRecipients
      .filter((r) => r && r.email && r.email.trim() !== '')
      .map((r) => {
        if (r.dynamicData) {
          delete r.dynamicData.__parsed_extra;
          for (const key in r.dynamicData) {
            if (r.dynamicData[key] !== null && r.dynamicData[key] !== undefined) {
              r.dynamicData[key] = String(r.dynamicData[key]);
            } else {
              delete r.dynamicData[key];
            }
          }
        }
        return r;
      });

    if (parsedRecipients.length === 0) {
      throw httpError(400, 'At least one recipient with a valid email is required');
    }

    const campaign = new Campaign({
      userId,
      title,
      templateSubject,
      templateBody,
      recipients: parsedRecipients,
      resumeUrl: resumeUrl || null,
      coverLetterUrl: coverLetterUrl || null,
    });

    return campaign.save();
  },

  async updateCampaign(userId, id, { title, templateSubject, templateBody }) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status !== 'Draft') {
      throw httpError(400, 'Only draft campaigns can be edited');
    }

    if (title !== undefined) campaign.title = title;
    if (templateSubject !== undefined) campaign.templateSubject = templateSubject;
    if (templateBody !== undefined) campaign.templateBody = templateBody;

    return campaign.save();
  },

  async deleteCampaign(userId, id) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status === 'Sending') {
      throw httpError(400, 'Cannot delete a campaign while it is sending');
    }
    await campaign.deleteOne();
    return { id };
  },

  /**
   * Verify SMTP, flip status to Sending, and kick off background processing.
   * Returns the campaign document immediately (send runs asynchronously).
   */
  async startCampaign(userId, id, batchSize) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status === 'Sending') throw httpError(400, 'Campaign is already sending');
    if (campaign.status === 'Completed') throw httpError(400, 'Campaign is already completed');

    const connection = await GmailConnection.findOne({ userId, status: 'active' });
    if (!connection) {
      throw httpError(
        400,
        'Gmail is not connected. Please connect your Gmail account in Mailer Settings.'
      );
    }

    activeCampaigns.set(id.toString(), { aborted: false, reason: null });
    campaign.status = 'Sending';
    await campaign.save();

    processEmails(campaign, id, connection, batchSize).catch((err) => {
      console.error('Background email processing error:', err);
      campaign.status = 'Partially Failed';
      campaign.save().catch(() => {});
      activeCampaigns.delete(id.toString());
    });

    return campaign;
  },

  async pauseCampaign(userId, id) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status !== 'Sending') {
      throw httpError(400, 'Campaign is not currently sending');
    }

    activeCampaigns.set(id.toString(), { aborted: true, reason: 'paused' });
    campaign.status = 'Paused';
    campaign.pausedAt = new Date();
    return campaign.save();
  },

  async stopCampaign(userId, id) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status !== 'Sending' && campaign.status !== 'Paused') {
      throw httpError(400, 'Campaign is not active or paused');
    }

    if (campaign.status === 'Sending') {
      activeCampaigns.set(id.toString(), { aborted: true, reason: 'stopped' });
    }
    campaign.status = 'Stopped';
    campaign.stoppedAt = new Date();
    return campaign.save();
  },

  async resumeCampaign(userId, id, startFromIndex, batchSize) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status !== 'Paused' && campaign.status !== 'Stopped') {
      throw httpError(400, 'Only paused or stopped campaigns can be resumed');
    }

    if (startFromIndex !== undefined && startFromIndex !== null) {
      const idx = Number(startFromIndex);
      if (idx >= 0 && idx < campaign.recipients.length) {
        for (let i = idx; i < campaign.recipients.length; i++) {
          campaign.recipients[i].status = 'Pending';
          campaign.recipients[i].failReason = undefined;
          campaign.recipients[i].sentAt = undefined;
          campaign.recipients[i].personalizedSubject = undefined;
          campaign.recipients[i].personalizedBody = undefined;
        }
        campaign.lastProcessedIndex = idx - 1;
        await campaign.save();
      }
    }

    return this.startCampaign(userId, id, batchSize);
  },

  async resetCampaign(userId, id) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status === 'Sending') {
      throw httpError(400, 'Cannot reset while sending');
    }

    campaign.status = 'Draft';
    campaign.recipients.forEach((r) => {
      r.status = 'Pending';
      r.failReason = undefined;
      r.sentAt = undefined;
    });
    return campaign.save();
  },

  async retryFailed(userId, id) {
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) throw httpError(404, 'Campaign not found');
    if (campaign.status === 'Sending') {
      throw httpError(400, 'Cannot retry while sending');
    }

    let hasFailed = false;
    campaign.recipients.forEach((r) => {
      if (r.status === 'Failed') {
        r.status = 'Pending';
        r.failReason = undefined;
        hasFailed = true;
      }
    });

    if (!hasFailed) {
      throw httpError(400, 'No failed recipients to retry');
    }

    campaign.status = 'Draft';
    return campaign.save();
  },

  /**
   * On boot, move campaigns stuck in "Sending" (from a prior crash/restart)
   * back to "Paused" so they can be resumed safely.
   */
  async recoverOrphanedCampaigns() {
    const orphaned = await Campaign.find({ status: 'Sending' });
    for (const campaign of orphaned) {
      let lastProcessed = -1;
      for (let i = 0; i < campaign.recipients.length; i++) {
        if (campaign.recipients[i].status !== 'Pending') {
          lastProcessed = i;
        }
      }
      campaign.status = 'Paused';
      campaign.lastProcessedIndex = lastProcessed;
      campaign.pausedAt = new Date();
      await campaign.save();
    }
    return orphaned.length;
  },
};

module.exports = { campaignService, httpError };
