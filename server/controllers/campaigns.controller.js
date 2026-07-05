const { campaignService } = require('../services/campaignService');

const listCampaigns = async (req, res, next) => {
  try {
    const campaigns = await campaignService.listCampaigns();
    res.json({ data: campaigns });
  } catch (error) {
    next(error);
  }
};

const getCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.getCampaign(req.params.id);
    res.json({ data: campaign });
  } catch (error) {
    next(error);
  }
};

const getCampaignStatus = async (req, res, next) => {
  try {
    const status = await campaignService.getCampaignStatus(req.params.id);
    res.json({ data: status });
  } catch (error) {
    next(error);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const { title, templateSubject, templateBody, recipients } = req.body;
    const campaign = await campaignService.createCampaign({
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
    const campaign = await campaignService.updateCampaign(req.params.id, {
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
    await campaignService.deleteCampaign(req.params.id);
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
        campaign = await campaignService.startCampaign(id);
        break;
      case 'pause':
        campaign = await campaignService.pauseCampaign(id);
        break;
      case 'stop':
        campaign = await campaignService.stopCampaign(id);
        break;
      case 'resume':
        campaign = await campaignService.resumeCampaign(id, startFromIndex);
        break;
      case 'retry-failed':
        campaign = await campaignService.retryFailed(id);
        break;
      case 'reset':
        campaign = await campaignService.resetCampaign(id);
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

module.exports = {
  listCampaigns,
  getCampaign,
  getCampaignStatus,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
};
