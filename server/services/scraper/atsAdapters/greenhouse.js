const axios = require('axios');
const stripHtml = require('../stripHtml');

module.exports = {
  matches: (url) => url.includes('boards.greenhouse.io') || url.includes('job-boards.eu.greenhouse.io'),
  fetchJobs: async (url, { logger = console } = {}) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      // typical format: /companyname or /companyname/jobs
      const token = parts[0];
      if (!token) return [];
      
      const isEu = url.includes('job-boards.eu.greenhouse.io');
      const apiHost = isEu ? 'boards-api.eu.greenhouse.io' : 'boards-api.greenhouse.io';
      
      const response = await axios.get(`https://${apiHost}/v1/boards/${token}/jobs?content=true`);
      
      return (response.data.jobs || []).map(j => ({
        title: j.title || 'Untitled Role',
        url: j.absolute_url || j.url,
        location: j.location?.name || 'Not specified',
        sourceType: 'ats',
        atsProvider: 'greenhouse',
        // Greenhouse already returns the full posting body with content=true - feed it
        // to the AI tagger as pageText so the stored description is cleaned real content.
        pageText: stripHtml(j.content || ''),
      }));
    } catch (err) {
      logger.error('[ATS:Greenhouse] Fetch failed:', err.message);
      return [];
    }
  }
};
