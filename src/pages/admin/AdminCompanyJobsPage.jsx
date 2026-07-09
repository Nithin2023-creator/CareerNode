import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { Loader2, ArrowLeft, Terminal, AlertCircle } from 'lucide-react';
import { useToast } from '../../lib/toast';

export default function AdminCompanyJobsPage() {
  const { id } = useParams();
  const [jobs, setJobs] = useState([]);
  const [audit, setAudit] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const toast = useToast();
  const skipPageFetch = useRef(true);

  useEffect(() => {
    skipPageFetch.current = true;
    setPagination({ page: 1, limit: 50, total: 0 });
    setJobs([]);
    fetchAudit();
    fetchJobs(1);
  }, [id]);

  useEffect(() => {
    if (skipPageFetch.current) {
      skipPageFetch.current = false;
      return;
    }
    fetchJobs(pagination.page);
  }, [pagination.page]);

  const fetchAudit = async () => {
    setInitialLoading(true);
    try {
      const auditRes = await adminApi.getCompanyLinkAudit(id);
      setAudit(auditRes);
    } catch {
      toast.error('Failed to fetch scrape audit data');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchJobs = async (page) => {
    setJobsLoading(true);
    try {
      const jobsRes = await adminApi.getCompanyJobs(id, { page, limit: pagination.limit });
      setJobs(jobsRes.jobs || []);
      setPagination((prev) => ({
        ...prev,
        page,
        total: jobsRes.pagination?.total ?? 0,
      }));
    } catch {
      toast.error('Failed to fetch saved jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'saved', label: 'Saved Jobs', count: pagination.total },
      { id: 'scraped', label: 'Scraped Links', count: audit?.linkAudit?.scraped?.length ?? 0 },
      { id: 'aiAccepted', label: 'AI Accepted', count: audit?.linkAudit?.aiAccepted?.length ?? 0 },
      { id: 'aiRejected', label: 'AI Rejected', count: audit?.linkAudit?.aiRejected?.length ?? 0 },
    ];

    return (
      <div className="flex space-x-2 border-b-2 border-black/10 mb-6 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-bold uppercase tracking-widest text-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-black text-white'
                : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black'
            }`}
          >
            {tab.label} <span className="ml-1 opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>
    );
  };

  const renderSavedJobs = () => (
    <div className="bento-card bg-white border-2 border-black rounded-2xl shadow-[var(--shadow-lift)] overflow-hidden relative">
      {jobsLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-black/50" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black text-white font-bold uppercase tracking-widest text-[10px]">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Experience</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4 text-right">Scraped At</th>
            </tr>
          </thead>
          <tbody className="text-black font-medium divide-y divide-black/10">
            {jobs.map(job => (
              <tr key={job._id} className="hover:bg-[var(--color-bg)] transition-colors">
                <td className="px-6 py-4 max-w-xs truncate">
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text-blue-600">
                    {job.title}
                  </a>
                </td>
                <td className="px-6 py-4">{job.location}</td>
                <td className="px-6 py-4">{job.experienceLevel}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-black/5 text-black/60 border border-black/10">
                    {job.sourceType} {job.atsProvider ? `(${job.atsProvider})` : ''}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-black/50 text-xs">
                  {new Date(job.scrapedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {!jobsLoading && jobs.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-12 text-center font-bold text-black/40 uppercase tracking-widest text-sm">No saved jobs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination.total > pagination.limit && (
        <div className="p-4 border-t-2 border-black/10 flex justify-between items-center bg-black/5">
          <button
            disabled={pagination.page === 1 || jobsLoading}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-4 py-2 bg-white border border-black/20 rounded font-bold text-xs uppercase disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-black/60 uppercase">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || jobsLoading}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-4 py-2 bg-white border border-black/20 rounded font-bold text-xs uppercase disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderLinkList = (links, emptyMessage) => {
    if (!audit?.linkAudit) {
      return (
        <div className="p-12 text-center border-2 border-dashed border-black/20 rounded-2xl bg-black/5">
          <AlertCircle className="w-8 h-8 mx-auto text-black/40 mb-3" />
          <p className="font-bold text-black/60 uppercase tracking-widest text-sm">No scrape run with link audit yet.</p>
          <p className="text-xs text-black/40 mt-1">Run a scrape to populate funnel tabs.</p>
        </div>
      );
    }

    if (!links || links.length === 0) {
      return (
        <div className="p-12 text-center border-2 border-dashed border-black/20 rounded-2xl bg-black/5">
          <p className="font-bold text-black/40 uppercase tracking-widest text-sm">{emptyMessage}</p>
          {audit.linkAudit.source === 'ats' && activeTab === 'aiRejected' && (
            <p className="text-xs text-black/50 mt-2 max-w-sm mx-auto">
              ATS scrapes bypass the AI link filtering step, so there are no rejected links.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="bento-card bg-white border-2 border-black rounded-2xl shadow-[var(--shadow-lift)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black text-white font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4 w-1/3">Link Text</th>
                <th className="px-6 py-4">URL</th>
              </tr>
            </thead>
            <tbody className="text-black font-medium divide-y divide-black/10">
              {links.map((link, idx) => (
                <tr key={idx} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4 font-bold max-w-[200px] truncate" title={link.linkText}>
                    {link.linkText || <span className="text-black/30 italic">No text</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs max-w-lg truncate" title={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600">
                      {link.href}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-black/50" /></div>;
  }

  const s = audit?.stats;
  const companyName = audit?.companyName || 'Company';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/admin/companies" className="inline-flex items-center gap-1 text-black/50 hover:text-black text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Companies
          </Link>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">{companyName}</h1>
          <p className="text-black/50 text-sm font-medium">Review saved listings and scrape funnel metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/admin/companies/${id}/scrape-logs`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-black/5 text-black rounded-lg border border-transparent hover:border-black/20 text-xs font-bold uppercase tracking-widest transition-all"
          >
            <Terminal className="w-4 h-4" /> Scrape Logs
          </button>
        </div>
      </div>

      {s && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white border-2 border-black rounded-xl shadow-[var(--shadow-soft)]">
          <span className="text-xs font-bold uppercase tracking-widest text-black/40 mr-2">Latest Scrape Summary:</span>

          <div className="px-3 py-1 bg-black/5 rounded font-mono text-xs font-bold border border-black/10">
            Source: <span className="text-black">{s.source}</span>
          </div>
          <div className="px-3 py-1 bg-black/5 rounded font-mono text-xs font-bold border border-black/10">
            Found: <span className="text-black">{s.linksFound}</span>
          </div>
          <div className="px-3 py-1 bg-black/5 rounded font-mono text-xs font-bold border border-black/10">
            Accepted: <span className="text-black">{s.linksAccepted}</span>
          </div>
          <div className="px-3 py-1 bg-black/5 rounded font-mono text-xs font-bold border border-black/10">
            Rejected: <span className="text-black">{s.linksRejected ?? 0}</span>
          </div>
          <div className="px-3 py-1 bg-green-100 rounded font-mono text-xs font-bold border border-green-200 text-green-800">
            Saved: <span>{s.jobsSaved ?? s.totalJobs}</span>
          </div>
        </div>
      )}

      <div>
        {renderTabs()}

        {activeTab === 'saved' && renderSavedJobs()}
        {activeTab === 'scraped' && renderLinkList(audit?.linkAudit?.scraped, 'No raw links discovered.')}
        {activeTab === 'aiAccepted' && renderLinkList(audit?.linkAudit?.aiAccepted, 'No links accepted.')}
        {activeTab === 'aiRejected' && renderLinkList(audit?.linkAudit?.aiRejected, 'No links rejected.')}
      </div>
    </div>
  );
}
