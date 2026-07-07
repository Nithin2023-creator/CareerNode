import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { coldMailerApi, gmailConnectionApi, uploadUrl } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';
import { isMobileViewport } from '../../lib/viewport.js';
import { CAMPAIGN_STATUS_STYLES, RECIPIENT_STATUS_STYLES, computeStats, formatDate, isGmailReady, isGmailRevoked } from './helpers.js';

const STAT_TILES = [
  { key: 'sent', label: 'Sent', color: 'text-emerald-600' },
  { key: 'failed', label: 'Failed', color: 'text-red-600' },
  { key: 'invalid', label: 'Invalid', color: 'text-orange-600' },
  { key: 'pending', label: 'Pending', color: 'text-black/50' },
];

export default function CampaignDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [selected, setSelected] = useState(null);
  const pollRef = useRef(null);
  const previewRef = useRef(null);

  const selectRecipient = (recipient) => {
    setSelected(recipient);
    if (isMobileViewport()) {
      requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  };

  const load = useCallback(
    async ({ silent } = {}) => {
      if (!silent) setLoading(true);
      try {
        const [data, gStatus] = await Promise.all([
          coldMailerApi.getCampaign(id),
          gmailConnectionApi.getStatus()
        ]);
        setCampaign(data);
        setGmailStatus(gStatus);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sending = campaign?.status === 'Sending';
    if (sending && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        try {
          const status = await coldMailerApi.getCampaignStatus(id);
          setCampaign((prev) => (prev ? { ...prev, ...status } : prev));
        } catch {
          /* keep last known state on transient poll errors */
        }
      }, 2000);
    } else if (!sending && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current && !sending) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [campaign?.status, id]);

  useEffect(() => () => pollRef.current && clearInterval(pollRef.current), []);

  const runAction = async (action, label) => {
    setBusy(true);
    try {
      await coldMailerApi.changeStatus(id, action);
      toast.success(`${label} successful.`);
      await load({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete campaign "${campaign.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await coldMailerApi.deleteCampaign(id);
      toast.success('Campaign deleted.');
      navigate('/dashboard/emailer/campaigns');
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bento-card h-40 animate-pulse bg-black/[0.03]" />
        <div className="bento-card h-96 animate-pulse bg-black/[0.03]" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bento-card p-10 text-center bg-white">
        <p className="font-display text-2xl font-bold uppercase mb-2">Campaign not found</p>
        <p className="text-black/50 mb-6">{error || 'This campaign may have been deleted.'}</p>
        <Link to="/dashboard/emailer/campaigns" className="pill-btn inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> BACK TO CAMPAIGNS
        </Link>
      </div>
    );
  }

  const stats = computeStats(campaign.recipients);
  const badgeClass = CAMPAIGN_STATUS_STYLES[campaign.status] || 'bg-black/5 text-black';
  const canLaunch = ['Draft', 'Paused', 'Stopped'].includes(campaign.status);
  const hasFailed = stats.failed > 0;

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/emailer/campaigns"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All Campaigns
      </Link>

      {!loading && gmailStatus && !isGmailReady(gmailStatus) && canLaunch && (
        <div className="rounded-[16px] bg-red-500/10 p-4 text-sm text-red-700 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            {isGmailRevoked(gmailStatus)
              ? 'Your Gmail access was revoked. Reconnect to launch this campaign.'
              : 'You must connect your Gmail account before launching this campaign.'}
          </span>
          <Link to="/dashboard/emailer/settings" className="pill-btn-secondary !bg-red-500/10 hover:!bg-red-500/20 !text-red-700 border-none !py-2 !px-4 shrink-0 text-center">
            CONNECT GMAIL
          </Link>
        </div>
      )}

      {/* Header + actions */}
      <div className="bento-card p-6 md:p-8 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0">
            <span className={`pill-badge ${badgeClass} mb-3`}>{campaign.status}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase leading-tight">
              {campaign.title}
            </h2>
            <p className="text-xs text-black/40 font-bold uppercase tracking-widest mt-2">
              Created {formatDate(campaign.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canLaunch && (
              <button
                disabled={busy || !isGmailReady(gmailStatus)}
                onClick={() => runAction(campaign.status === 'Draft' ? 'send' : 'resume', campaign.status === 'Draft' ? 'Launch' : 'Resume')}
                className="pill-btn !px-5 !py-2.5 text-sm flex items-center gap-1.5 disabled:opacity-50"
                title={!isGmailReady(gmailStatus) ? (isGmailRevoked(gmailStatus) ? 'Reconnect Gmail first' : 'Connect Gmail first') : ''}
              >
                <Play className="h-4 w-4" /> {campaign.status === 'Draft' ? 'LAUNCH' : 'RESUME'}
              </button>
            )}
            {campaign.status === 'Sending' && (
              <>
                <button
                  disabled={busy}
                  onClick={() => runAction('pause', 'Pause')}
                  className="pill-btn-secondary !px-5 !py-2.5 text-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Pause className="h-4 w-4" /> PAUSE
                </button>
                <button
                  disabled={busy}
                  onClick={() => runAction('stop', 'Stop')}
                  className="pill-btn-secondary !px-5 !py-2.5 text-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Square className="h-4 w-4" /> STOP
                </button>
              </>
            )}
            {hasFailed && campaign.status !== 'Sending' && (
              <button
                disabled={busy}
                onClick={() => runAction('retry-failed', 'Retry')}
                className="pill-btn-secondary !px-5 !py-2.5 text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" /> RETRY FAILED
              </button>
            )}
            {campaign.status !== 'Sending' && campaign.status !== 'Draft' && (
              <button
                disabled={busy}
                onClick={() => runAction('reset', 'Reset')}
                className="pill-btn-secondary !px-5 !py-2.5 text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" /> RESET
              </button>
            )}
            {campaign.status !== 'Sending' && (
              <button
                disabled={busy}
                onClick={handleDelete}
                className="pill-btn-secondary !px-4 !py-2.5 text-sm flex items-center gap-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-black/50 mb-2">
            <span>
              {stats.processed}/{stats.total} processed
            </span>
            <span>{stats.progress}%</span>
          </div>
          <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--color-accent-yellow)]"
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {STAT_TILES.map((tile) => (
            <div key={tile.key} className="rounded-[20px] bg-black/[0.03] p-3 sm:p-4">
              <p className={`font-display text-2xl sm:text-3xl font-bold ${tile.color}`}>{stats[tile.key]}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-black/40 mt-1">{tile.label}</p>
            </div>
          ))}
        </div>

        {/* Attachments */}
        {(campaign.resumeUrl || campaign.coverLetterUrl) && (
          <div className="flex flex-wrap gap-3 mt-6">
            {campaign.resumeUrl && (
              <a
                href={uploadUrl(campaign.resumeUrl)}
                target="_blank"
                rel="noreferrer"
                className="pill-badge bg-black/5 hover:bg-black/10 transition-colors"
              >
                <Paperclip className="h-3.5 w-3.5" /> Resume
              </a>
            )}
            {campaign.coverLetterUrl && (
              <a
                href={uploadUrl(campaign.coverLetterUrl)}
                target="_blank"
                rel="noreferrer"
                className="pill-badge bg-black/5 hover:bg-black/10 transition-colors"
              >
                <Paperclip className="h-3.5 w-3.5" /> Cover Letter
              </a>
            )}
          </div>
        )}
      </div>

      {/* Recipients + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bento-card p-0 bg-white overflow-hidden">
          <div className="p-6 md:p-8 border-b border-black/10">
            <h3 className="font-display text-2xl font-bold uppercase">Recipients</h3>
          </div>
          <div className="md:hidden divide-y divide-black/5">
            {campaign.recipients.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectRecipient(r)}
                className={`w-full text-left p-4 transition-colors hover:bg-black/[0.02] ${
                  selected === r ? 'bg-[var(--color-accent-yellow)]/10' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <p className="font-bold truncate">{r.companyName || '—'}</p>
                  <span className={`pill-badge shrink-0 ${RECIPIENT_STATUS_STYLES[r.status] || 'bg-black/5 text-black'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{r.hrName || '—'}</p>
                <p className="text-sm text-black/50 truncate mt-1">{r.email}</p>
              </button>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-black/40">
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">HR Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaign.recipients.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => selectRecipient(r)}
                    className={`border-t border-black/5 cursor-pointer transition-colors hover:bg-black/[0.02] ${
                      selected === r ? 'bg-[var(--color-accent-yellow)]/10' : ''
                    }`}
                  >
                    <td className="px-6 py-3 font-medium truncate max-w-[160px]">{r.companyName || '—'}</td>
                    <td className="px-6 py-3 truncate max-w-[140px]">{r.hrName || '—'}</td>
                    <td className="px-6 py-3 truncate max-w-[200px]">{r.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`pill-badge ${RECIPIENT_STATUS_STYLES[r.status] || 'bg-black/5 text-black'}`}
                        title={r.failReason || ''}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview panel */}
        <div className="lg:col-span-1" ref={previewRef}>
          <div className="bento-card p-6 md:p-8 bg-white lg:sticky lg:top-6">
            <h3 className="font-display text-2xl font-bold uppercase mb-5">Preview</h3>
            {selected ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-black/40">To</span>
                  <p className="font-medium break-words">{selected.email}</p>
                </div>
                {selected.failReason && (
                  <div className="rounded-[16px] bg-red-500/10 p-3 text-sm text-red-700 font-medium">
                    {selected.failReason}
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-black/40">Subject</span>
                  <p className="font-display font-bold mt-1">
                    {selected.personalizedSubject || campaign.templateSubject}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-black/40">Body</span>
                  <div className="mt-2 rounded-[20px] bg-black/[0.03] p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap max-h-[360px] overflow-y-auto">
                    {selected.personalizedBody || campaign.templateBody}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-black/40 text-sm">Select a recipient to preview their personalized email.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
