const Company = require('../../models/Company');
const scrapeRunner = require('./scrapeRunner');

const TICK_INTERVAL_MS = 60 * 60 * 1000; // hourly
// Sequential with a short delay between companies (same interruptible-throttle style as
// campaignService.js's email send loop) to bound concurrent Playwright/browser memory use.
const THROTTLE_BETWEEN_COMPANIES_MS = parseInt(process.env.SCRAPER_SCHEDULER_THROTTLE_MS, 10) || 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Scans all active companies and kicks off a scrape for any due for a rescan. Runs an
 * hourly tick (rather than a single 24h timer) so it self-heals across PM2 restarts/deploys
 * without drifting - the actual "already scanned today" rule lives in scrapeRunner and is
 * shared with the manual admin Scrape button, so this tick doesn't duplicate that logic.
 */
async function runDueScans() {
  try {
    const companies = await Company.find({ isActive: true }).select('_id lastScrapedAt');
    for (const company of companies) {
      const dueForRescan = !company.lastScrapedAt || Date.now() - company.lastScrapedAt.getTime() >= 24 * 60 * 60 * 1000;
      if (!dueForRescan) continue;
      if (scrapeRunner.isRunning(company._id)) continue;

      try {
        const result = await scrapeRunner.startScrapeRun({ companyId: company._id, trigger: 'scheduled' });
        if (result.status === 'running') {
          console.log(`[ScrapeScheduler] Started scheduled scrape for company ${company._id}.`);
        }
      } catch (err) {
        console.error(`[ScrapeScheduler] Failed to start scrape for company ${company._id}:`, err.message);
      }

      // Give the just-started run's browser a head start before launching the next one.
      await sleep(THROTTLE_BETWEEN_COMPANIES_MS);
    }
  } catch (err) {
    console.error('[ScrapeScheduler] Error scanning companies:', err.message);
  }
}

function startScrapeScheduler() {
  runDueScans();
  setInterval(runDueScans, TICK_INTERVAL_MS);
  console.log('[ScrapeScheduler] Started 24h auto-scan scheduler (hourly self-healing tick).');
}

module.exports = { startScrapeScheduler, runDueScans };
