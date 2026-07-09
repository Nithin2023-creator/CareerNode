const { chromium } = require('playwright');

// Production-tunable via env vars instead of hardcoded values.
const MAX_PAGES = parseInt(process.env.SCRAPER_MAX_PAGES, 10) || 20;
const MAX_SCROLLS = parseInt(process.env.SCRAPER_MAX_SCROLLS, 10) || 15;
const DISCOVERY_TIMEOUT_MS = parseInt(process.env.SCRAPER_DISCOVERY_TIMEOUT_MS, 10) || 3 * 60 * 1000;

class GenericCrawler {
  async discoverJobLinks(startUrl, { logger = console } = {}) {
    let browser;
    const links = [];
    const deadline = Date.now() + DISCOVERY_TIMEOUT_MS;

    try {
      browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();

      const landed = await this._gotoWithRetry(page, startUrl, logger);
      if (!landed) return [];
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Handle lazy loading and "Load More"
      await this._scrollToBottom(page);
      await this._clickLoadMore(page);

      let pageNum = 1;

      while (pageNum <= MAX_PAGES) {
        if (Date.now() > deadline) {
          logger.warn(`[GenericCrawler] Discovery timeout (${DISCOVERY_TIMEOUT_MS}ms) reached after ${pageNum - 1} page(s). Stopping early.`);
          break;
        }

        const extracted = await this._extractLinks(page);
        links.push(...extracted);

        // Try to find a Next button
        const nextUrl = await this._findNextPageUrl(page);
        if (!nextUrl) break;

        const navigated = await this._gotoWithRetry(page, nextUrl, logger);
        if (!navigated) break;
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        await this._scrollToBottom(page);
        pageNum++;
      }

    } catch (err) {
      logger.error('[GenericCrawler] Error scraping:', err.message);
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }

    // Deduplicate on href
    const seen = new Set();
    return links.filter(l => {
      if (seen.has(l.href)) return false;
      seen.add(l.href);
      return true;
    });
  }

  // One retry on navigation timeout/failure so a single flaky load doesn't kill the whole run.
  async _gotoWithRetry(page, url, logger, retriesLeft = 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      return true;
    } catch (err) {
      if (retriesLeft > 0) {
        logger.warn(`[GenericCrawler] Navigation to ${url} failed (${err.message}), retrying once...`);
        return this._gotoWithRetry(page, url, logger, retriesLeft - 1);
      }
      logger.error(`[GenericCrawler] Navigation to ${url} failed after retry:`, err.message);
      return false;
    }
  }

  async _scrollToBottom(page) {
    let prevHeight = 0;
    for (let i = 0; i < MAX_SCROLLS; i++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await new Promise(r => setTimeout(r, 1000));
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === prevHeight) break;
      prevHeight = newHeight;
    }
  }

  async _clickLoadMore(page) {
    const LOAD_MORE_SELECTORS = [
      'button:has-text("Load More")',
      'button:has-text("Show More")',
      'a:has-text("Load More")',
      '[class*="load-more"]'
    ];
    for (const sel of LOAD_MORE_SELECTORS) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click().catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  async _findNextPageUrl(page) {
    const NEXT_SELECTORS = [
      '[aria-label="Next"]', 'a[rel="next"]',
      'a:has-text("Next")'
    ];
    for (const sel of NEXT_SELECTORS) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        const href = await btn.getAttribute('href');
        if (href) {
           return new URL(href, page.url()).toString();
        }
      }
    }
    return null;
  }

  async _extractLinks(page) {
    return await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const text = a.textContent.trim().replace(/\\s+/g, ' ');
        if (text && text.length > 2) { // Minimum length for a job title
          results.push({
            href: a.href,
            linkText: text,
            surroundingText: a.parentElement ? a.parentElement.textContent.trim().replace(/\\s+/g, ' ') : ''
          });
        }
      });
      return results;
    });
  }
}

module.exports = new GenericCrawler();
