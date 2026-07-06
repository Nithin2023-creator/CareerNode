require('dotenv').config();
const scraperService = require('../services/scraper/scraperService');

async function main() {
  const testCases = [
    {
      companyName: 'Stripe',
      careersPageUrl: 'https://jobs.lever.co/stripe'
    },
    {
      companyName: 'Linear',
      careersPageUrl: 'https://linear.app/careers' // Generic page fallback
    }
  ];

  for (const tc of testCases) {
    console.log(`\n==============================================`);
    console.log(`Testing scraper for: ${tc.companyName}`);
    try {
      const result = await scraperService.scrapeCompany(tc);
      console.log(`\nResults for ${tc.companyName}:`);
      console.log(`- Source: ${result.stats.source}`);
      console.log(`- Total jobs normalized: ${result.stats.totalJobs}`);
      
      if (result.jobs.length > 0) {
        console.log(`- Sample job:`, result.jobs[0]);
      } else {
        console.log(`- No jobs returned.`);
      }
    } catch (err) {
      console.error(`Error scraping ${tc.companyName}:`, err);
    }
  }

  console.log(`\nDone.`);
  process.exit(0);
}

main();
