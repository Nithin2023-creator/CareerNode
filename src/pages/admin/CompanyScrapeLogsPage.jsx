import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { adminApi } from '../../lib/api';

const STATUS_STYLES = {
  running: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  failed: 'bg-red-500/20 text-red-300 border-red-500/40',
};

export default function CompanyScrapeLogsPage() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const eventSourceRef = useRef(null);

  const loadRun = async () => {
    try {
      const latest = await adminApi.getLatestScrapeRun(id);
      setRun(latest);
      if (latest && latest.status !== 'running') {
        setLines((latest.logs || []).map((l) => l.message));
      }
      return latest;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const latest = await loadRun();
      if (cancelled) return;

      if (latest && latest.status === 'running') {
        const url = adminApi.getScrapeLogsStreamUrl(id);
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const { line } = JSON.parse(event.data);
            setLines((prev) => [...prev, line]);
          } catch {
            // ignore malformed events
          }
        };

        es.addEventListener('end', () => {
          es.close();
          loadRun();
        });

        es.onerror = () => {
          es.close();
        };
      }
    })();

    return () => {
      cancelled = true;
      eventSourceRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <div className="border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Close Tab
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {run?.companyName || 'Scrape Logs'}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {run ? (
            <>
              <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${STATUS_STYLES[run.status] || 'bg-white/10 text-white/60 border-white/20'}`}>
                {run.status === 'running' && <Loader2 className="inline h-3 w-3 mr-1 animate-spin" />}
                {run.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 font-bold uppercase tracking-widest border border-white/10">
                {run.trigger}
              </span>
              <span className="text-white/40">
                Started {new Date(run.startedAt).toLocaleString()}
              </span>
              {run.finishedAt && (
                <span className="text-white/40">
                  · Finished {new Date(run.finishedAt).toLocaleString()}
                </span>
              )}
            </>
          ) : (
            <span className="text-white/40">No scrape runs yet for this company.</span>
          )}
          <button
            onClick={loadRun}
            title="Refresh"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {run?.stats && (
        <div className="px-6 py-3 border-b border-white/10 flex flex-wrap gap-6 text-xs text-white/50 font-mono">
          <span>source: {run.stats.source ?? '-'}</span>
          <span>linksFound: {run.stats.linksFound ?? '-'}</span>
          <span>linksAccepted: {run.stats.linksAccepted ?? '-'}</span>
          <span>linksRejected: {run.stats.linksRejected ?? '-'}</span>
          <span>totalJobs: {run.stats.totalJobs ?? '-'}</span>
          <span>jobsSaved: {run.stats.jobsSaved ?? '-'}</span>
        </div>
      )}

      {run?.error && (
        <div className="px-6 py-3 border-b border-white/10 bg-red-500/10 text-red-300 text-sm font-mono">
          {run.error}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 font-mono text-xs leading-relaxed"
      >
        {lines.length === 0 ? (
          <p className="text-white/30">No log output yet.</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="text-emerald-300/90 whitespace-pre-wrap break-all">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
