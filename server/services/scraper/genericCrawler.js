const { chromium } = require('playwright');

class GenericCrawler {
  async discoverJobLinks(startUrl) {
    let browser;
    const links = [];
    
    try {
      browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();

      await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Handle lazy loading and "Load More"
      await this._scrollToBottom(page);
      await this._clickLoadMore(page);

      // Simple pagination (check up to 5 pages)
      const MAX_PAGES = 5;
      let pageNum = 1;

      while (pageNum <= MAX_PAGES) {
        const extracted = await this._extractLinks(page);
        links.push(...extracted);

        // Try to find a Next button
        const nextUrl = await this._findNextPageUrl(page);
        if (!nextUrl) break;

        await page.goto(nextUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        await this._scrollToBottom(page);
        pageNum++;
      }

    } catch (err) {
      console.error('[GenericCrawler] Error scraping:', err.message);
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

  async _scrollToBottom(page) {
    const MAX_SCROLLS = 10;
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
