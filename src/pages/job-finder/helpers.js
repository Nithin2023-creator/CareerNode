// Job Finder Helpers

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const PIPELINE_STATUS = {
  QUEUED: 'queued',
  CRAWLING: 'crawling',
  EXTRACTING: 'extracting',
  MATCHING: 'matching',
  EMAILING: 'emailing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const MATCH_TIER = {
  STRONG: 'strong_match',
  POSSIBLE: 'possible_match',
  NEEDS_REVIEW: 'needs_review',
  NO_MATCH: 'no_match',
};



export const getSubscriptionStatusColor = (status) => {
  switch (status) {
    case SUBSCRIPTION_STATUS.ACTIVE: return 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]';
    case SUBSCRIPTION_STATUS.EXPIRING: return 'bg-[var(--color-accent-yellow)]/20 text-[var(--color-accent-yellow)]';
    case SUBSCRIPTION_STATUS.EXPIRED: return 'bg-red-100 text-red-600';
    case SUBSCRIPTION_STATUS.CANCELLED: return 'bg-black/5 text-black';
    default: return 'bg-black/5 text-black';
  }
};

export const getMatchTierColor = (tier) => {
  switch (tier) {
    case MATCH_TIER.STRONG: return 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]';
    case MATCH_TIER.POSSIBLE: return 'bg-[var(--color-accent-yellow)]/20 text-black';
    case MATCH_TIER.NEEDS_REVIEW: return 'bg-black/10 text-black';
    case MATCH_TIER.NO_MATCH: return 'bg-black/5 text-black';
    default: return 'bg-black/5 text-black';
  }
};

export { formatDate, withMockFallback } from '../../lib/apiHelpers';

export const computeSubscriptionStats = (subscriptions) => {
  const activeCount = subscriptions.filter(s => s.status === 'active' || s.status === 'expiring').length;
  const expiringCount = subscriptions.filter(s => s.status === 'expiring').length;
  const newMatches = subscriptions.reduce((sum, s) => sum + (s.newMatchesCount || 0), 0);
  const companiesWatched = subscriptions.length;

  return { activeCount, expiringCount, newMatches, companiesWatched };
};



const csvEscape = (value) => {
  const str = value == null ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

// Build a CSV string from a list of jobs and trigger a browser download.
export const exportJobsToCsv = (jobs, filename = 'jobs.csv') => {
  const headers = ['Title', 'Company', 'Location', 'Employment Type', 'Experience', 'Match Tier', 'Score', 'Bookmarked', 'URL'];
  const rows = (jobs || []).map((j) => [
    j.title,
    j.company,
    j.location,
    j.employmentType,
    j.experienceLevel,
    (j.matchTier || '').replace(/_/g, ' '),
    j.matchScore,
    j.isBookmarked ? 'Yes' : 'No',
    j.url,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const hasSeenJobFinderIntro = () => {
  try {
    return localStorage.getItem('jf_intro_seen') === 'true';
  } catch {
    return false;
  }
};

export const markJobFinderIntroSeen = () => {
  try {
    localStorage.setItem('jf_intro_seen', 'true');
  } catch {
    // ignore — private mode or storage quota
  }
};
