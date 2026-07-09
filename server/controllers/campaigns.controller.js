const { campaignService } = require('../services/campaignService');
const coldMailerPricing = require('../config/coldMailerPricing');
const walletService = require('../services/walletService');
const paymentService = require('../services/paymentService');
const GmailConnection = require('../models/GmailConnection');

const listCampaigns = async (req, res, next) => {
  try {
    const campaigns = await campaignService.listCampaigns(req.user._id);
    res.json({ data: campaigns });
  } catch (error) {
    next(error);
  }
};

const getCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.getCampaign(req.user._id, req.params.id);
    res.json({ data: campaign });
  } catch (error) {
    next(error);
  }
};

const getCampaignStatus = async (req, res, next) => {
  try {
    const status = await campaignService.getCampaignStatus(req.user._id, req.params.id);
    res.json({ data: status });
  } catch (error) {
    next(error);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const { title, templateSubject, templateBody, recipients } = req.body;
    const campaign = await campaignService.createCampaign({
      userId: req.user._id,
      title,
      templateSubject,
      templateBody,
      recipients,
      resumeUrl: req.files?.resume?.[0]?.filename || null,
      coverLetterUrl: req.files?.coverLetter?.[0]?.filename || null,
    });
    res.status(201).json({ data: campaign });
  } catch (error) {
    next(error);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const { title, templateSubject, templateBody } = req.body;
    const campaign = await campaignService.updateCampaign(req.user._id, req.params.id, {
      title,
      templateSubject,
      templateBody,
    });
    res.json({ data: campaign });
  } catch (error) {
    next(error);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    await campaignService.deleteCampaign(req.user._id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Single resource-oriented state transition endpoint.
// Body: { action: 'send' | 'pause' | 'stop' | 'resume' | 'retry-failed' | 'reset', startFromIndex? }
const updateCampaignStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, startFromIndex } = req.body || {};

    let campaign;
    switch (action) {
      case 'send':
      case 'resume':
        return res.status(402).json({
          error: 'Payment required before sending. Complete send checkout first.',
        });
      case 'pause':
        campaign = await campaignService.pauseCampaign(req.user._id, id);
        break;
      case 'stop':
        campaign = await campaignService.stopCampaign(req.user._id, id);
        break;
      case 'retry-failed':
        campaign = await campaignService.retryFailed(req.user._id, id);
        break;
      case 'reset':
        campaign = await campaignService.resetCampaign(req.user._id, id);
        break;
      default:
        return res.status(400).json({
          error: "Invalid action. Use one of: send, pause, stop, resume, retry-failed, reset",
        });
    }

    res.json({ data: campaign });
  } catch (error) {
    next(error);
  }
};

const getSendCheckout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await campaignService.getCampaign(userId, id);
    const pendingRecipients = campaign.recipients.filter(r => r.status === 'Pending').length;
    if (pendingRecipients === 0) {
      return res.status(400).json({ error: 'No pending recipients to send to.' });
    }

    const dailyRemaining = await campaignService.getDailySendRemaining(userId);
    const batchSize = Math.min(pendingRecipients, dailyRemaining);

    if (batchSize === 0) {
      return res.json({
        data: {
          batchSize: 0,
          dailyRemainingAfter: 0,
          pendingRecipients,
          rate: null,
          priceInr: 0,
          priceCredits: 0
        }
      });
    }

    const dailyRemainingAfter = dailyRemaining - batchSize;

    // Calculate price
    const { paygUnitEmails, paygPriceInr, paygCredits, dailyPackEmails, dailyPackPriceInr, dailyPackCredits } = coldMailerPricing;
    
    const paygCostInr = Math.ceil(batchSize / paygUnitEmails) * paygPriceInr;
    const paygCostCredits = Math.ceil(batchSize / paygUnitEmails) * paygCredits;

    let rate = 'payg';
    let priceInr = paygCostInr;
    let priceCredits = paygCostCredits;

    if (paygCostInr >= dailyPackPriceInr || batchSize >= (dailyPackPriceInr / paygPriceInr) * paygUnitEmails) {
      rate = 'pack';
      priceInr = dailyPackPriceInr;
      priceCredits = dailyPackCredits;
    }

    res.json({
      data: {
        batchSize,
        dailyRemainingAfter,
        pendingRecipients,
        rate,
        priceInr,
        priceCredits
      }
    });
  } catch (error) {
    next(error);
  }
};

const confirmSendCheckout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { paymentMethod } = req.body; // 'credits' or 'alacarte'

    if (!paymentMethod || !['credits', 'alacarte'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method.' });
    }

    const campaign = await campaignService.getCampaign(userId, id);
    const pendingRecipients = campaign.recipients.filter(r => r.status === 'Pending').length;
    if (pendingRecipients === 0) {
      return res.status(400).json({ error: 'No pending recipients to send to.' });
    }

    const dailyRemaining = await campaignService.getDailySendRemaining(userId);
    const batchSize = Math.min(pendingRecipients, dailyRemaining);

    if (batchSize === 0) {
      return res.status(400).json({ error: 'Daily send limit reached.' });
    }

    const { paygUnitEmails, paygPriceInr, paygCredits, dailyPackPriceInr, dailyPackCredits } = coldMailerPricing;
    
    const paygCostInr = Math.ceil(batchSize / paygUnitEmails) * paygPriceInr;
    const paygCostCredits = Math.ceil(batchSize / paygUnitEmails) * paygCredits;

    let priceInr = paygCostInr;
    let priceCredits = paygCostCredits;

    if (paygCostInr >= dailyPackPriceInr || batchSize >= (dailyPackPriceInr / paygPriceInr) * paygUnitEmails) {
      priceInr = dailyPackPriceInr;
      priceCredits = dailyPackCredits;
    }

    if (paymentMethod === 'credits') {
      await walletService.spendCredits(userId, priceCredits, `Sent ${batchSize} cold emails`, 'cold-mailer');
      
      const connection = await GmailConnection.findOne({ userId, status: 'active' });
      if (connection) {
        connection.sentToday = (connection.sentToday || 0) + batchSize;
        connection.sentTodayDate = new Date();
        await connection.save();
      }
      
      let updatedCampaign;
      if (campaign.status === 'Draft') {
        updatedCampaign = await campaignService.startCampaign(userId, id, batchSize);
      } else {
        updatedCampaign = await campaignService.resumeCampaign(userId, id, undefined, batchSize);
      }

      return res.json({ data: updatedCampaign });
    } else if (paymentMethod === 'alacarte') {
      const { orderId, paymentSessionId } = await paymentService.createOrder({
        userId,
        amount: priceInr,
        orderType: 'cold_mailer_send',
        referenceId: id.toString(),
        cartItems: [{ batchSize }],
        customerDetails: {
          name: req.user.name,
          email: req.user.email,
        },
      });

      return res.json({
        data: {
          orderId,
          paymentSessionId,
        },
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCampaigns,
  getCampaign,
  getCampaignStatus,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  getSendCheckout,
  confirmSendCheckout,
};
