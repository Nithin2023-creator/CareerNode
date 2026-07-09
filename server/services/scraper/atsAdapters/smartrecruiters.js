const axios = require('axios');
const stripHtml = require('../stripHtml');

// SmartRecruiters' postings list endpoint only returns summaries; the full description
// lives behind a per-posting detail call, fetched here with bounded concurrency (plain
// HTTP calls, not a browser, so this stays cheap even for large postings lists).
const DETAIL_CONCURRENCY = 5;

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

module.exports = {
  matches: (url) => url.includes('careers.smartrecruiters.com'),
  fetchJobs: async (url, { logger = console } = {}) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const token = parts[0];
      if (!token) return [];

      const response = await axios.get(`https://api.smartrecruiters.com/v1/companies/${token}/postings`);
      const postings = response.data.content || [];

      return await mapWithConcurrency(postings, DETAIL_CONCURRENCY, async (j) => {
        let pageText = '';
        try {
          const detail = await axios.get(`https://api.smartrecruiters.com/v1/companies/${token}/postings/${j.id}`);
          const sections = detail.data?.jobAd?.sections || {};
          pageText = Object.values(sections).map((s) => s?.text || '').join(' ');
        } catch (err) {
          logger.warn(`[ATS:SmartRecruiters] Detail fetch failed for posting ${j.id}: ${err.message}`);
        }

        return {
          title: j.name || 'Untitled Role',
          url: `https://jobs.smartrecruiters.com/${j.company?.identifier || token}/${j.id}`,
          location: j.location?.city ? `${j.location.city}, ${j.location.country}` : 'Not specified',
          sourceType: 'ats',
          atsProvider: 'smartrecruiters',
          pageText: stripHtml(pageText),
        };
      });
    } catch (err) {
      logger.error('[ATS:SmartRecruiters] Fetch failed:', err.message);
      return [];
    }
  }
};
