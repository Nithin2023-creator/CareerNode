const { detectAts } = require('./atsAdapters');
const genericCrawler = require('./genericCrawler');
const linkClassifier = require('./linkClassifier');
const jobTagger = require('./jobTagger');

class ScraperService {
  async scrapeCompany({ careersPageUrl, companyName }) {
    console.log(`[Scraper] Starting scrape for ${companyName} (${careersPageUrl})`);
    
    let rawJobs = [];
    let sourceType = 'generic';
    let atsProvider = null;

    // 1. Try ATS Adapters
    const adapter = detectAts(careersPageUrl);
    if (adapter) {
      console.log(`[Scraper] Detected ATS: ${careersPageUrl}`);
      rawJobs = await adapter.fetchJobs(careersPageUrl);
      if (rawJobs.length > 0) {
        sourceType = 'ats';
        atsProvider = rawJobs[0].atsProvider;
      }
    }

    // 2. Generic Crawler Fallback
    let linksFound = 0;
    let linksAccepted = 0;
    
    if (rawJobs.length === 0) {
      console.log(`[Scraper] No ATS detected or no jobs found. Falling back to generic crawler...`);
      const scrapedLinks = await genericCrawler.discoverJobLinks(careersPageUrl);
      linksFound = scrapedLinks.length;
      
      const u = new URL(careersPageUrl);
      const { accepted, ambiguous } = linkClassifier.filterLinks(scrapedLinks, u.hostname);
      
      // Could enhance to use AI on ambiguous, but relying on heuristic accepted for now
      linksAccepted = accepted.length;
      
      rawJobs = accepted.map(link => ({
        title: link.linkText,
        url: link.href,
        location: 'Not specified',
        sourceType: 'generic',
        atsProvider: null
      }));
    }

    // 3. AI Tagger
    console.log(`[Scraper] Tagging ${rawJobs.length} jobs...`);
    const taggedJobs = await jobTagger.tagJobs(rawJobs);

    // 4. Normalize Output
    const finalJobs = taggedJobs.map(job => ({
      title: job.title,
      url: job.url,
      location: job.location,
      experienceLevel: job.experienceLevel || 'Mid-Level',
      tags: job.tags || [],
      companyName: companyName,
      sourceType: job.sourceType || sourceType,
      atsProvider: job.atsProvider || atsProvider,
      scrapedAt: new Date()
    }));

    console.log(`[Scraper] Scrape complete. Found ${finalJobs.length} jobs.`);

    return {
      jobs: finalJobs,
      stats: {
        source: sourceType,
        linksFound,
        linksAccepted,
        totalJobs: finalJobs.length
      }
    };
  }
}

module.exports = new ScraperService();
