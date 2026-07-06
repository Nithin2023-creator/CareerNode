const axios = require('axios');

module.exports = {
  matches: (url) => url.includes('careers.smartrecruiters.com'),
  fetchJobs: async (url) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const token = parts[0];
      if (!token) return [];

      const response = await axios.get(`https://api.smartrecruiters.com/v1/companies/${token}/postings`);
      
      return (response.data.content || []).map(j => ({
        title: j.name || 'Untitled Role',
        url: `https://jobs.smartrecruiters.com/${j.company?.identifier || token}/${j.id}`,
        location: j.location?.city ? `${j.location.city}, ${j.location.country}` : 'Not specified',
        sourceType: 'ats',
        atsProvider: 'smartrecruiters'
      }));
    } catch (err) {
      console.error('[ATS:SmartRecruiters] Fetch failed:', err.message);
      return [];
    }
  }
};
