const axios = require('axios');

module.exports = {
  matches: (url) => url.includes('boards.greenhouse.io') || url.includes('job-boards.eu.greenhouse.io'),
  fetchJobs: async (url) => {
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
        atsProvider: 'greenhouse'
      }));
    } catch (err) {
      console.error('[ATS:Greenhouse] Fetch failed:', err.message);
      return [];
    }
  }
};
