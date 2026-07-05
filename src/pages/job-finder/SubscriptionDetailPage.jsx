import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Activity, CreditCard, Coins, CheckCircle2 } from 'lucide-react';
import { jobFinderApi } from '../../lib/api';
import { withMockFallback, getSubscriptionStatusColor, formatDate } from './helpers';
import { mockSubscriptions, mockCompanies, mockJobs } from './mockData';
import ProgressPipeline from '../../components/job-finder/ProgressPipeline';
import JobCard from '../../components/job-finder/JobCard';
import { useToast } from '../../lib/toast';

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [subscription, setSubscription] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // new, all, saved
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const sub = await withMockFallback(jobFinderApi.getSubscription(id), mockSubscriptions.find(s => s.id === id) || mockSubscriptions[0]);
        const comp = await withMockFallback(jobFinderApi.listMarketplaceCompanies(), mockCompanies).then(comps => comps.find(c => c.id === sub.companyId));
        // Mock returning jobs for this sub
        const subJobs = await withMockFallback(jobFinderApi.getCompanyJobs(sub.companyId), mockJobs.filter(j => j.subscriptionId === sub.id));
        
        setSubscription(sub);
        setCompany(comp);
        setJobs(subJobs || []);
      } catch {
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, toast]);

  const handleToggleBookmark = async (jobId) => {
    try {
      await withMockFallback(jobFinderApi.toggleBookmark(id, jobId), { success: true });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isBookmarked: !j.isBookmarked } : j));
    } catch {
      toast.error('Failed to bookmark job');
    }
  };

  const handleRenew = async () => {
    setRenewing(true);
    try {
      await withMockFallback(jobFinderApi.renewSubscription(id), { success: true });
      toast.success('Subscription renewed for 1 month');
      // Update local state to simulate renewal
      setSubscription(prev => ({
        ...prev,
        status: 'active',
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
      }));
    } catch {
      toast.error('Failed to renew subscription');
    } finally {
      setRenewing(false);
    }
  };

  if (loading || !subscription || !company) {
    return <div className="p-8 text-black/40 font-bold uppercase tracking-widest text-sm">Loading details...</div>;
  }

  const filteredJobs = jobs.filter(j => {
    if (activeTab === 'saved') return j.isBookmarked;
    if (activeTab === 'new') return j.isNew;
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Header Back Link */}
      <Link to="/dashboard/job-finder/subscriptions" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Subscriptions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: Header & Pipeline & Jobs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Card */}
          <div className="bento-card bg-white p-6 md:p-8 border border-black/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-black/10 shadow-sm" />
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-black/5 flex-shrink-0" />
                )}
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">{company.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest ${getSubscriptionStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                    <span className="text-sm font-bold text-black/40 flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Expires {formatDate(subscription.expiresAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              {subscription.status === 'expiring' && (
                <button 
                  onClick={handleRenew}
                  disabled={renewing}
                  className="pill-btn bg-[var(--color-accent-blue)] text-white hover:bg-black w-full md:w-auto flex justify-center items-center"
                >
                  {renewing ? 'RENEWING...' : 'RENEW NOW'}
                </button>
              )}
            </div>

            {/* Pipeline Status */}
            <div className="bg-black/5 p-6 rounded-[24px]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Scan Engine Status
              </h3>
              {/* Reuse Pipeline, mock status to extracting for visual effect */}
              <ProgressPipeline status="extracting" />
              <p className="text-[10px] font-bold uppercase text-black/40 mt-4 text-center">
                Last checked: {formatDate(subscription.lastScanAt)}. The engine monitors this company automatically.
              </p>
            </div>
          </div>

          {/* Job Feed */}
          <div className="bento-card bg-white border border-black/5 overflow-hidden">
            <div className="border-b border-black/10 flex overflow-x-auto hide-scrollbar bg-black/[0.02]">
              {['new', 'all', 'saved'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-5 text-sm font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap
                    ${activeTab === tab ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
                >
                  {tab === 'new' ? 'New Matches' : tab === 'all' ? 'All Found' : 'Saved'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8 space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-black/40">
                  <p className="font-bold uppercase tracking-widest text-sm mb-2">No jobs found</p>
                  <p className="text-xs">We haven't found any roles matching your profile in this category yet.</p>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onToggleBookmark={() => handleToggleBookmark(job.id)} 
                  />
                ))
              )}
            </div>
          </div>
          
        </div>

        {/* Right Col: Metadata Panel */}
        <div className="space-y-6">
          <div className="bento-card bg-white p-6 md:p-8 border border-black/5">
            <h3 className="font-display text-2xl font-bold uppercase mb-6 border-b border-black/10 pb-4">Details</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">Purchased On</p>
                <p className="font-medium text-black">{formatDate(subscription.purchasedAt)}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">Payment Method</p>
                <div className="flex items-center gap-2 font-medium text-black capitalize">
                  {subscription.paymentMethod === 'credits' ? <Coins className="h-4 w-4 text-[var(--color-accent-yellow)]" /> : <CreditCard className="h-4 w-4 text-[var(--color-accent-blue)]" />}
                  {subscription.paymentMethod}
                </div>
              </div>

              <div className="pt-4 border-t border-black/5">
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="font-medium text-black/70 leading-relaxed">
                    Auto-scan is active. You will receive a notification and email digest when new roles matching your profile are posted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
