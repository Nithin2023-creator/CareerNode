const { detectAts } = require('./atsAdapters');
const genericCrawler = require('./genericCrawler');
const linkClassifier = require('./linkClassifier');
const linkAiClassifier = require('./linkAiClassifier');
const jobDetailFetcher = require('./jobDetailFetcher');
const jobTagger = require('./jobTagger');

class ScraperService {
  async scrapeCompany({ careersPageUrl, companyName, logger = console }) {
    logger.log(`[Scraper] Starting scrape for ${companyName} (${careersPageUrl})`);

    let rawJobs = [];
    let sourceType = 'generic';
    let atsProvider = null;
    let linkAudit = { source: 'generic', scraped: [], aiAccepted: [], aiRejected: [] };
    let linksFound = 0;
    let linksAccepted = 0;
    let linksRejected = 0;

    // 1. Try ATS Adapters (real REST APIs - Greenhouse/Lever/Ashby/SmartRecruiters)
    const adapter = detectAts(careersPageUrl);
    if (adapter) {
      logger.log(`[Scraper] Detected ATS for: ${careersPageUrl}`);
      rawJobs = await adapter.fetchJobs(careersPageUrl, { logger });
      if (rawJobs.length > 0) {
        sourceType = 'ats';
        atsProvider = rawJobs[0].atsProvider;
        const atsLinks = rawJobs.map(j => ({ href: j.url, linkText: j.title }));
        linkAudit = {
          source: 'ats',
          scraped: atsLinks,
          aiAccepted: atsLinks,
          aiRejected: []
        };
        linksFound = rawJobs.length;
        linksAccepted = rawJobs.length;
      }
    }

    // 2. Generic Crawler Fallback: discover links, then AI-filter to real job postings
    // (instead of silently dropping "ambiguous" links), then visit each confirmed job's
    // detail page to capture real description text.
    if (rawJobs.length === 0) {
      logger.log(`[Scraper] No ATS detected or no jobs found. Falling back to generic crawler...`);
      const scrapedLinks = await genericCrawler.discoverJobLinks(careersPageUrl, { logger });
      linksFound = scrapedLinks.length;
      linkAudit.scraped = scrapedLinks.map(l => ({ href: l.href, linkText: l.linkText }));

      const u = new URL(careersPageUrl);
      const { accepted, ambiguous } = linkClassifier.filterLinks(scrapedLinks, u.hostname);

      logger.log(`[Scraper] Heuristic prefilter: ${accepted.length} accepted, ${ambiguous.length} ambiguous of ${linksFound} raw link(s). Sending candidates to AI classifier...`);
      const candidates = [...accepted, ...ambiguous];
      
      const { accepted: aiAccepted, rejected: aiRejected } = await linkAiClassifier.classifyLinks(candidates, { logger });
      
      linksAccepted = aiAccepted.length;
      linksRejected = aiRejected.length;
      linkAudit.aiAccepted = aiAccepted.map(l => ({ href: l.href, linkText: l.linkText }));
      linkAudit.aiRejected = aiRejected.map(l => ({ href: l.href, linkText: l.linkText }));
      
      logger.log(`[Scraper] AI classifier confirmed ${linksAccepted} real job posting link(s) (rejected ${linksRejected}).`);

      logger.log(`[Scraper] Visiting ${aiAccepted.length} job detail page(s) to extract descriptions...`);
      const withDetails = await jobDetailFetcher.fetchDetails(aiAccepted, { logger });

      rawJobs = withDetails.map(link => ({
        title: link.linkText,
        url: link.href,
        location: 'Not specified',
        sourceType: 'generic',
        atsProvider: null,
        pageText: link.pageText || '',
      }));
    }

    // 3. AI Tagger: strict structured field extraction (experienceLevel, employmentType,
    // normalized location, description, tags) so the DB holds clean, exact-match-able data.
    logger.log(`[Scraper] Extracting structured fields for ${rawJobs.length} job(s)...`);
    const taggedJobs = await jobTagger.tagJobs(rawJobs, { logger });

    // 4. Normalize Output
    const finalJobs = taggedJobs.map(job => ({
      title: job.title,
      url: job.url,
      location: job.location,
      experienceLevel: job.experienceLevel || 'Mid-Level',
      employmentType: job.employmentType || 'Not specified',
      description: job.description || '',
      tags: job.tags || [],
      companyName: companyName,
      sourceType: job.sourceType || sourceType,
      atsProvider: job.atsProvider || atsProvider,
      scrapedAt: new Date()
    }));

    logger.log(`[Scraper] Scrape complete. Found ${finalJobs.length} job(s).`);

    return {
      jobs: finalJobs,
      stats: {
        source: sourceType,
        linksFound,
        linksAccepted,
        linksRejected,
        totalJobs: finalJobs.length
      },
      linkAudit
    };
  }
}

module.exports = new ScraperService();
