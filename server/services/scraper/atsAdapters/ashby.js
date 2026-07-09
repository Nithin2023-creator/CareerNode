const axios = require('axios');
const stripHtml = require('../stripHtml');

module.exports = {
  matches: (url) => url.includes('jobs.ashbyhq.com'),
  fetchJobs: async (url, { logger = console } = {}) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const token = parts[0];
      if (!token) return [];

      // Ashby returns data via their job-board API
      const response = await axios.get(`https://api.ashbyhq.com/posting-api/job-board/${token}`);
      
      return (response.data.jobs || []).map(j => ({
        title: j.title || 'Untitled Role',
        url: j.jobUrl,
        location: j.location || 'Not specified',
        sourceType: 'ats',
        atsProvider: 'ashby',
        pageText: stripHtml(j.descriptionHtml || j.descriptionPlain || ''),
      }));
    } catch (err) {
      logger.error('[ATS:Ashby] Fetch failed:', err.message);
      return [];
    }
  }
};
