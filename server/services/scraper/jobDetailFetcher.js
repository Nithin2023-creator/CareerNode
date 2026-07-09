const { chromium } = require('playwright');

// Visiting one page per job (instead of one page per company) is the main new
// production-risk area, so concurrency and per-page timeouts are both bounded and
// tunable via env without a code change.
const DETAIL_CONCURRENCY = parseInt(process.env.SCRAPER_DETAIL_CONCURRENCY, 10) || 3;
const DETAIL_TIMEOUT_MS = parseInt(process.env.SCRAPER_DETAIL_TIMEOUT_MS, 10) || 20000;

class JobDetailFetcher {
  /**
   * Visits each job's own detail page (one browser instance shared across all jobs of a
   * company, several pages open concurrently) and grabs its visible text, later fed to the
   * AI tagger to extract a clean structured description. A failure on one job's detail page
   * is logged and skipped - it does not fail the whole scrape run.
   */
  async fetchDetails(jobLinks, { logger = console } = {}) {
    if (jobLinks.length === 0) return [];

    let browser;
    const results = new Array(jobLinks.length);

    try {
      browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      let nextIndex = 0;
      const worker = async () => {
        while (nextIndex < jobLinks.length) {
          const idx = nextIndex++;
          const link = jobLinks[idx];
          const page = await context.newPage();
          try {
            await page.goto(link.href, { waitUntil: 'domcontentloaded', timeout: DETAIL_TIMEOUT_MS });
            const pageText = await page.evaluate(() => document.body.innerText.slice(0, 8000));
            results[idx] = { ...link, pageText };
          } catch (err) {
            logger.warn(`[JobDetailFetcher] Failed to fetch detail page ${link.href}: ${err.message}`);
            results[idx] = { ...link, pageText: '' };
          } finally {
            await page.close().catch(() => {});
          }
        }
      };

      const workerCount = Math.min(DETAIL_CONCURRENCY, jobLinks.length);
      await Promise.all(Array.from({ length: workerCount }, () => worker()));
    } catch (err) {
      logger.error('[JobDetailFetcher] Fatal error, returning links without page text:', err.message);
      return jobLinks.map(link => ({ ...link, pageText: '' }));
    } finally {
      if (browser) await browser.close().catch(() => {});
    }

    return results;
  }
}

module.exports = new JobDetailFetcher();
