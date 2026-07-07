import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Trash2,
  Users,
  Inbox,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { coldMailerApi, gmailConnectionApi } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';
import { CAMPAIGN_STATUS_STYLES, computeStats, formatDate, isGmailReady, isGmailRevoked } from './helpers.js';

export default function CampaignsListPage() {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [gmailStatus, setGmailStatus] = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(
    async ({ silent } = {}) => {
      if (!silent) setLoading(true);
      try {
        const [data, gStatus] = await Promise.all([
          coldMailerApi.listCampaigns(),
          gmailConnectionApi.getStatus()
        ]);
        setCampaigns(data || []);
        if (!silent) setGmailStatus(gStatus);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 2s only while at least one campaign is actively sending.
  useEffect(() => {
    const anySending = campaigns.some((c) => c.status === 'Sending');
    if (anySending && !pollRef.current) {
      pollRef.current = setInterval(() => load({ silent: true }), 2000);
    } else if (!anySending && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current && !anySending) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [campaigns, load]);

  useEffect(() => () => pollRef.current && clearInterval(pollRef.current), []);

  const runAction = async (id, action, label) => {
    setBusyId(id);
    try {
      await coldMailerApi.changeStatus(id, action);
      toast.success(`${label} successful.`);
      await load({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete campaign "${title}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await coldMailerApi.deleteCampaign(id);
      toast.success('Campaign deleted.');
      await load({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bento-card p-8 h-52 animate-pulse bg-black/[0.03]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bento-card p-10 text-center bg-white">
        <p className="font-display text-2xl font-bold uppercase mb-2">Something went wrong</p>
        <p className="text-black/50 mb-6">{error}</p>
        <button onClick={() => load()} className="pill-btn">
          TRY AGAIN
        </button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bento-card p-12 md:p-16 text-center bg-white flex flex-col items-center">
        <div className="p-4 bg-[var(--color-accent-yellow)]/20 rounded-[24px] mb-6">
          <Inbox className="h-10 w-10 text-black" />
        </div>
        <h3 className="font-display text-3xl md:text-4xl font-bold uppercase mb-3">No campaigns yet</h3>
        <p className="text-black/50 max-w-md mb-8">
          Create your first bulk campaign by uploading a CSV of contacts, mapping the columns, and writing a
          personalized template.
        </p>
        <Link to="/dashboard/emailer/campaigns/new" className="pill-btn flex items-center gap-2">
          <Plus className="h-5 w-5" /> NEW CAMPAIGN
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!loading && gmailStatus && !isGmailReady(gmailStatus) && (
        <div className="rounded-[16px] bg-red-500/10 p-4 text-sm text-red-700 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            {isGmailRevoked(gmailStatus)
              ? 'Your Gmail access was revoked. Reconnect to launch campaigns.'
              : 'You must connect your Gmail account before launching campaigns.'}
          </span>
          <Link to="/dashboard/emailer/settings" className="pill-btn-secondary !bg-red-500/10 hover:!bg-red-500/20 !text-red-700 border-none !py-2 !px-4 shrink-0 text-center">
            CONNECT GMAIL
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {campaigns.map((campaign, idx) => {
        const stats = computeStats(campaign.recipients);
        const isBusy = busyId === campaign._id;
        const badgeClass = CAMPAIGN_STATUS_STYLES[campaign.status] || 'bg-black/5 text-black';

        return (
          <motion.div
            key={campaign._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bento-card p-6 md:p-8 bg-white flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="min-w-0">
                <span className={`pill-badge ${badgeClass} mb-3`}>{campaign.status}</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold uppercase leading-tight truncate">
                  {campaign.title}
                </h3>
                <p className="text-xs text-black/40 font-bold uppercase tracking-widest mt-2">
                  {formatDate(campaign.createdAt)}
                </p>
              </div>
              <Link
                to={`/dashboard/emailer/campaigns/${campaign._id}`}
                className="p-2 rounded-full bg-black/5 hover:bg-black hover:text-white transition-colors flex-shrink-0"
                aria-label="View campaign"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-black/50 mb-2">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {stats.sent}/{stats.total} sent
                </span>
                <span>{stats.progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[var(--color-accent-yellow)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              {(stats.failed > 0 || stats.invalid > 0) && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-orange-600/80 mt-2">
                  {stats.failed} failed · {stats.invalid} invalid
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-wrap gap-2">
              {(campaign.status === 'Draft' ||
                campaign.status === 'Paused' ||
                campaign.status === 'Stopped') && (
                <button
                  disabled={isBusy || !isGmailReady(gmailStatus)}
                  onClick={() =>
                    runAction(
                      campaign._id,
                      campaign.status === 'Draft' ? 'send' : 'resume',
                      campaign.status === 'Draft' ? 'Launch' : 'Resume'
                    )
                  }
                  className="pill-btn !px-4 !py-2 text-sm flex items-center gap-1.5 disabled:opacity-50"
                  title={!isGmailReady(gmailStatus) ? (isGmailRevoked(gmailStatus) ? 'Reconnect Gmail first' : 'Connect Gmail first') : ''}
                >
                  <Play className="h-4 w-4" /> {campaign.status === 'Draft' ? 'LAUNCH' : 'RESUME'}
                </button>
              )}

              {campaign.status === 'Sending' && (
                <>
                  <button
                    disabled={isBusy}
                    onClick={() => runAction(campaign._id, 'pause', 'Pause')}
                    className="pill-btn-secondary !px-4 !py-2 text-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Pause className="h-4 w-4" /> PAUSE
                  </button>
                  <button
                    disabled={isBusy}
                    onClick={() => runAction(campaign._id, 'stop', 'Stop')}
                    className="pill-btn-secondary !px-4 !py-2 text-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Square className="h-4 w-4" /> STOP
                  </button>
                </>
              )}

              {(campaign.status === 'Completed' || campaign.status === 'Partially Failed') &&
                stats.failed > 0 && (
                  <button
                    disabled={isBusy}
                    onClick={() => runAction(campaign._id, 'retry-failed', 'Retry')}
                    className="pill-btn-secondary !px-4 !py-2 text-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" /> RETRY FAILED
                  </button>
                )}

              {campaign.status !== 'Sending' && (
                <button
                  disabled={isBusy}
                  onClick={() => handleDelete(campaign._id, campaign.title)}
                  className="pill-btn-secondary !px-4 !py-2 text-sm flex items-center gap-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
      </div>
    </div>
  );
}
