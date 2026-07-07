const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const Wallet = require('../models/Wallet');
const aiService = require('../services/aiService');
const atsScoreService = require('../services/atsScoreService');
const creditActionService = require('../services/creditActionService');
const { getPricingEntry } = require('../config/pricingCatalog');

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error('Failed to clean up file:', filePath);
  }
};

const extractTextFromFile = async (file) => {
  if (!file) return '';
  const buffer = fs.readFileSync(file.path);

  try {
    if (file.mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        return result.text || '';
      } finally {
        await parser.destroy();
      }
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
  } catch (error) {
    console.error('File extraction error:', error);
  } finally {
    safeUnlink(file.path);
  }
  return '';
};

const resumesController = {
  async listResumes(req, res, next) {
    try {
      const resumes = await Resume.find({ userId: req.user.id })
        .select('title mode atsScore.overall atsScore.updatedAt createdAt updatedAt')
        .sort({ createdAt: -1 });
      res.json(resumes);
    } catch (error) {
      next(error);
    }
  },

  async getResume(req, res, next) {
    try {
      const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
      if (!resume) return res.status(404).json({ error: 'Resume not found' });
      res.json(resume);
    } catch (error) {
      next(error);
    }
  },

  async createResume(req, res, next) {
    try {
      const resume = new Resume({
        ...req.body,
        userId: req.user.id
      });
      await resume.save();
      res.status(201).json(resume);
    } catch (error) {
      next(error);
    }
  },

  async updateResume(req, res, next) {
    try {
      const resume = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!resume) return res.status(404).json({ error: 'Resume not found' });
      res.json(resume);
    } catch (error) {
      next(error);
    }
  },

  async deleteResume(req, res, next) {
    try {
      const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      if (!resume) return res.status(404).json({ error: 'Resume not found' });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async tailorResume(req, res, next) {
    try {
      const userId = req.user.id;
      const { jobDescription, resumeText, paidOrderId } = req.body;

      if (!jobDescription) {
        if (req.file) safeUnlink(req.file.path);
        return res.status(400).json({ error: 'Job description is required.' });
      }

      // Fail fast on the credits path (before spending compute on AI) if the
      // user hasn't paid a la carte and can't afford the action.
      if (!paidOrderId) {
        const entry = getPricingEntry('resume-tailor');
        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < entry.creditCost) {
          if (req.file) safeUnlink(req.file.path);
          return res.status(402).json({
            error: 'Insufficient credits',
            required: entry.creditCost,
            available: wallet ? wallet.balance : 0,
          });
        }
      }

      let rawText = resumeText || '';
      if (req.file) {
        rawText = await extractTextFromFile(req.file);
      }

      if (!rawText.trim()) {
        return res.status(400).json({ error: 'Could not extract resume text. Please provide valid text or a PDF/DOCX file.' });
      }

      // 1. Parse text into JSON
      const parsedData = await aiService.parseResumeText(rawText);

      // 2. Tailor JSON to JD
      const tailoredData = await aiService.tailorResume(parsedData, jobDescription);

      // 3. Generate ATS Score
      const atsScore = atsScoreService.scoreResume(tailoredData, jobDescription);

      // Charge only on success (credits or redeem a la carte order).
      const charge = await creditActionService.chargeForAction({
        userId,
        actionId: 'resume-tailor',
        paidOrderId,
        source: 'resume-maker',
      });

      res.json({
        data: {
          data: tailoredData,
          atsScore,
          jobDescription,
          mode: 'tailored'
        },
        balance: charge.balance ?? null
      });
    } catch (error) {
      if (req.file) safeUnlink(req.file.path);
      next(error);
    }
  },

  async scoreResume(req, res, next) {
    try {
      const { resume, jobDescription } = req.body;
      if (!resume) return res.status(400).json({ error: 'Resume data required' });
      
      const score = atsScoreService.scoreResume(resume, jobDescription);
      res.json(score);
    } catch (error) {
      next(error);
    }
  },

  async exportResume(req, res, next) {
    try {
      const userId = req.user.id;
      // Only charge for a 'scratch' export. Tailored resumes are free to export
      // (the AI tailoring step already covered the cost).
      const { mode, paidOrderId } = req.body;

      if (mode !== 'scratch') {
        return res.json({ success: true, balance: null });
      }

      const charge = await creditActionService.chargeForAction({
        userId,
        actionId: 'resume-export',
        paidOrderId,
        source: 'resume-maker',
      });

      res.json({ success: true, balance: charge.balance ?? null });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = resumesController;
