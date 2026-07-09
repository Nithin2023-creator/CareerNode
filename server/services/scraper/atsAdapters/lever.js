const axios = require('axios');
const stripHtml = require('../stripHtml');

module.exports = {
  matches: (url) => url.includes('jobs.lever.co'),
  fetchJobs: async (url, { logger = console } = {}) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const token = parts[0];
      if (!token) return [];

      let response;
      try {
        response = await axios.get(`https://api.lever.co/v0/postings/${token}?mode=json`);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Retry with EU host
          response = await axios.get(`https://api.eu.lever.co/v0/postings/${token}?mode=json`);
        } else {
          throw err;
        }
      }

      const arr = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      return arr.map(j => ({
        title: j.text || j.title || 'Untitled Role',
        url: j.hostedUrl || j.url,
        location: j.categories?.location || 'Not specified',
        sourceType: 'ats',
        atsProvider: 'lever',
        pageText: stripHtml(j.descriptionPlain || j.description || ''),
      }));
    } catch (err) {
      logger.error('[ATS:Lever] Fetch failed:', err.message);
      return [];
    }
  }
};
