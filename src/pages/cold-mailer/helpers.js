export const isGmailReady = (status) => Boolean(status?.connected);

export const isGmailRevoked = (status) => status?.status === 'revoked';

// Standard token fields recognized by the backend for personalization.
export const TEMPLATE_TOKENS = ['companyName', 'hrName', 'email', 'role'];

export const STANDARD_FIELDS = ['companyName', 'hrName', 'email', 'role', 'dynamicData'];

// Visual styling per campaign status, using the CareerNode palette.
export const CAMPAIGN_STATUS_STYLES = {
  Draft: 'bg-black/5 text-black',
  Sending: 'bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)]',
  Paused: 'bg-[var(--color-accent-yellow)]/25 text-black',
  Stopped: 'bg-black/10 text-black/70',
  Completed: 'bg-emerald-500/15 text-emerald-700',
  'Partially Failed': 'bg-orange-500/15 text-orange-700',
};

// Visual styling per recipient status.
export const RECIPIENT_STATUS_STYLES = {
  Pending: 'bg-black/5 text-black/60',
  Sent: 'bg-emerald-500/15 text-emerald-700',
  Failed: 'bg-red-500/15 text-red-700',
  Invalid: 'bg-orange-500/15 text-orange-700',
};

export function computeStats(recipients = []) {
  const total = recipients.length;
  const sent = recipients.filter((r) => r.status === 'Sent').length;
  const failed = recipients.filter((r) => r.status === 'Failed').length;
  const invalid = recipients.filter((r) => r.status === 'Invalid').length;
  const pending = recipients.filter((r) => r.status === 'Pending').length;
  const processed = sent + failed + invalid;
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
  return { total, sent, failed, invalid, pending, processed, progress };
}

export function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

// Convert raw CSV rows into standardized recipient objects using a
// { header -> standardField } mapping. Headers mapped to 'dynamicData'
// are collected into a per-recipient dynamicData object.
export function standardizeRows(rows, mapping) {
  return rows.map((row) => {
    const recipient = { dynamicData: {} };
    Object.entries(mapping).forEach(([header, field]) => {
      const value = row[header];
      if (field === 'dynamicData') {
        if (value !== undefined && value !== null && value !== '') {
          recipient.dynamicData[header] = String(value);
        }
      } else if (field && field !== 'ignore') {
        recipient[field] = value !== undefined && value !== null ? String(value) : '';
      }
    });
    return recipient;
  });
}

// Render a template string with a recipient's values for live preview.
export function renderTemplate(text, recipient = {}) {
  if (!text) return '';
  return text.replace(/{{(.*?)}}/g, (match, tokenName) => {
    const key = tokenName.trim();
    if (recipient[key] !== undefined && recipient[key] !== null && recipient[key] !== '') {
      return recipient[key];
    }
    if (recipient.dynamicData && recipient.dynamicData[key] !== undefined) {
      return recipient.dynamicData[key];
    }
    return match;
  });
}
