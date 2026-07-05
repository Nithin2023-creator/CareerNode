const waitlistService = require('../services/waitlistService');

exports.joinWaitlist = async (req, res, next) => {
  try {
    const { email, tool, wantsInsider } = req.body;
    const entry = await waitlistService.joinWaitlist({ email, tool, wantsInsider });
    res.status(201).json({ data: entry });
  } catch (error) {
    next(error);
  }
};

exports.getWaitlistCount = async (req, res, next) => {
  try {
    const tool = req.query.tool || 'automations';
    const count = await waitlistService.getWaitlistCount(tool);
    res.status(200).json({ data: { count } });
  } catch (error) {
    next(error);
  }
};
