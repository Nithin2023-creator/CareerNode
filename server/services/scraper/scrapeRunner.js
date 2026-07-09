const Company = require('../../models/Company');
const JobListing = require('../../models/JobListing');
const ScrapeRun = require('../../models/ScrapeRun');
const scraperService = require('./scraperService');
const scrapeLogBus = require('./scrapeLogBus');

const DAY_MS = 24 * 60 * 60 * 1000;

// Guards against two concurrent scrapes of the same company (manual + scheduled racing,
// or a double click) - mirrors the `activeCampaigns` in-memory registry pattern used by
// campaignService.js.
const activeRuns = new Map(); // companyId string -> runId string

function normalizeExperienceLevel(level) {
  if (!level) return 'Mid-Level';
  const lower = level.toLowerCase();
  if (lower.includes('entry')) return 'Entry-Level';
  if (lower.includes('senior')) return 'Senior';
  if (lower.includes('staff') || lower.includes('principal')) return 'Staff/Principal';
  if (lower.includes('manager') || lower.includes('director')) return 'Manager/Director';
  return 'Mid-Level';
}

// Writes to both stdout (so PM2/terminal logs still show everything, as before) and the
// in-memory scrapeLogBus (so the admin's "See Terminal" tab can tail this specific run).
function createRunLogger(companyId) {
  const write = (level, args) => {
    const message = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    const prefixed = `[Scrape:${companyId}] ${message}`;
    if (level === 'error') console.error(prefixed);
    else if (level === 'warn') console.warn(prefixed);
    else console.log(prefixed);
    scrapeLogBus.append(companyId, message);
  };
  return {
    log: (...args) => write('log', args),
    warn: (...args) => write('warn', args),
    error: (...args) => write('error', args),
  };
}

async function persistJobs(companyId, jobs, logger) {
  let jobsSaved = 0;
  for (const job of jobs) {
    try {
      await JobListing.findOneAndUpdate(
        { companyId, url: job.url },
        {
          title: job.title,
          location: job.location || 'Not specified',
          experienceLevel: normalizeExperienceLevel(job.experienceLevel),
          employmentType: job.employmentType || 'Not specified',
          description: job.description || '',
          tags: job.tags || [],
          sourceType: job.sourceType || 'generic',
          atsProvider: job.atsProvider || null,
          scrapedAt: job.scrapedAt || new Date(),
        },
        { upsert: true, new: true }
      );
      jobsSaved++;
    } catch (err) {
      logger.error(`Failed to upsert job ${job.url}: ${err.message}`);
    }
  }
  return jobsSaved;
}

// Runs detached from the HTTP request/scheduler tick that kicked it off.
async function runScrapeJob(company, scrapeRun, logger) {
  const companyId = company._id;
  try {
    const result = await scraperService.scrapeCompany({
      careersPageUrl: company.careersPageUrl,
      companyName: company.name,
      logger,
    });

    const jobsSaved = await persistJobs(companyId, result.jobs || [], logger);
    // No stale-job cleanup - postings no longer found on a rescan are left as-is.
    const openRoles = await JobListing.countDocuments({ companyId });

    company.lastScrapedAt = new Date();
    company.lastScrapeStatus = 'success';
    company.lastScrapeError = null;
    company.lastScrapeStats = { ...result.stats, jobsSaved };
    company.openRoles = openRoles;
    await company.save();

    scrapeRun.status = 'success';
    scrapeRun.stats = { ...result.stats, jobsSaved };
    if (result.linkAudit) {
      scrapeRun.linkAudit = result.linkAudit;
    }
    scrapeRun.finishedAt = new Date();
    scrapeRun.logs = scrapeLogBus.getBuffered(companyId).map((line) => ({ message: line }));
    await scrapeRun.save();

    logger.log(`Run finished successfully. ${jobsSaved} job(s) saved, ${openRoles} total open role(s).`);
  } catch (err) {
    logger.error(`Scrape run crashed: ${err.message}`);

    company.lastScrapeStatus = 'failed';
    company.lastScrapeError = err.message;
    await company.save().catch(() => {});

    scrapeRun.status = 'failed';
    scrapeRun.error = err.message;
    scrapeRun.finishedAt = new Date();
    scrapeRun.logs = scrapeLogBus.getBuffered(companyId).map((line) => ({ message: line }));
    await scrapeRun.save().catch(() => {});
  } finally {
    activeRuns.delete(companyId.toString());
    scrapeLogBus.end(companyId);
    scrapeLogBus.clear(companyId);
  }
}

const scrapeRunner = {
  /**
   * Kicks off a scrape run without awaiting the actual crawl - callers (HTTP handler or
   * the scheduler tick) get an immediate status back. Skip-if-scanned-today lives here so
   * both the manual admin "Scrape" button and the scheduled 24h scan share one rule.
   */
  async startScrapeRun({ companyId, trigger, force = false }) {
    const company = await Company.findById(companyId);
    if (!company) {
      const err = new Error('Company not found');
      err.statusCode = 404;
      throw err;
    }

    const key = companyId.toString();
    if (activeRuns.has(key)) {
      return { status: 'running', runId: activeRuns.get(key) };
    }

    if (!force && company.lastScrapedAt && Date.now() - company.lastScrapedAt.getTime() < DAY_MS) {
      return { status: 'skipped', lastScrapedAt: company.lastScrapedAt };
    }

    const scrapeRun = await ScrapeRun.create({
      companyId: company._id,
      companyName: company.name,
      trigger,
      status: 'running',
      startedAt: new Date(),
    });

    activeRuns.set(key, scrapeRun._id.toString());
    company.lastScrapeStatus = 'running';
    await company.save();

    const logger = createRunLogger(company._id);
    logger.log(`Scrape run started (trigger: ${trigger}${force ? ', forced' : ''}).`);

    runScrapeJob(company, scrapeRun, logger);

    return { status: 'running', runId: scrapeRun._id.toString() };
  },

  async getLatestRun(companyId) {
    return ScrapeRun.findOne({ companyId }).sort({ createdAt: -1 }).lean();
  },

  isRunning(companyId) {
    return activeRuns.has(companyId.toString());
  },

  // Mirrors campaignService.recoverOrphanedCampaigns(): a run left "running" after a
  // crash/restart can never finish naturally since the in-memory registry is gone.
  async recoverOrphanedRuns() {
    const result = await ScrapeRun.updateMany(
      { status: 'running' },
      { $set: { status: 'failed', error: 'Interrupted by server restart', finishedAt: new Date() } }
    );
    await Company.updateMany(
      { lastScrapeStatus: 'running' },
      { $set: { lastScrapeStatus: 'failed', lastScrapeError: 'Interrupted by server restart' } }
    );
    return result.modifiedCount || 0;
  },
};

module.exports = scrapeRunner;
