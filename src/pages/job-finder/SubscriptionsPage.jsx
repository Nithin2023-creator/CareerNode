import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListPlus, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { jobFinderApi } from '../../lib/api';
import { withMockFallback, computeSubscriptionStats, getSubscriptionStatusColor, formatDate } from './helpers';
import { mockSubscriptions, mockCompanies } from './mockData';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, expiring, expired

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subsData = await withMockFallback(jobFinderApi.listSubscriptions(), mockSubscriptions);
        const compData = await withMockFallback(jobFinderApi.listMarketplaceCompanies(), mockCompanies);
        setSubscriptions(subsData || []);
        setCompanies(compData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = computeSubscriptionStats(subscriptions);

  const getCompanyForSub = (sub) => companies.find(c => c.id === sub.companyId) || { name: 'Unknown Company' };

  const filteredSubs = subscriptions.filter(s => {
    if (activeTab === 'active') return s.status === 'active' || s.status === 'expiring';
    if (activeTab === 'expiring') return s.status === 'expiring';
    if (activeTab === 'expired') return s.status === 'expired' || s.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card bg-[var(--color-accent-blue)]/5 border border-[var(--color-accent-blue)]/20 p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-accent-blue)]/60 mb-2">Active</p>
          <p className="font-display text-3xl md:text-5xl font-bold text-[var(--color-accent-blue)]">{stats.activeCount}</p>
        </div>
        <div className="bento-card bg-white p-6 md:p-8 border border-black/5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-bold uppercase tracking-widest text-black/40 mb-2">New Matches</p>
          <p className="font-display text-3xl md:text-5xl font-bold text-black">{stats.newMatches}</p>
        </div>
        <div className="bento-card bg-[var(--color-accent-yellow)]/10 border border-[var(--color-accent-yellow)]/30 p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-accent-yellow)] mb-2">Expiring Soon</p>
          <p className="font-display text-3xl md:text-5xl font-bold text-black">{stats.expiringCount}</p>
        </div>
        <div className="bento-card bg-white p-6 md:p-8 border border-black/5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-bold uppercase tracking-widest text-black/40 mb-2">Companies Watched</p>
          <p className="font-display text-3xl md:text-5xl font-bold text-black">{stats.companiesWatched}</p>
        </div>
      </div>

      {/* Tabs & List */}
      <div className="bento-card bg-white border border-black/5 overflow-hidden">
        
        <div className="border-b border-black/10 flex overflow-x-auto hide-scrollbar">
          {['active', 'expiring', 'expired'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 md:px-8 py-5 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative
                ${activeTab === tab ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
            >
              {tab === 'expiring' ? 'Expiring Soon' : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="text-center py-12 text-black/40 font-bold uppercase tracking-widest">Loading...</div>
          ) : filteredSubs.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <ListPlus className="h-16 w-16 text-black/20 mb-4" />
              <h3 className="font-display text-2xl font-bold uppercase mb-2">No {activeTab} subscriptions</h3>
              <p className="text-black/50 font-medium mb-6">Browse the marketplace to start monitoring companies.</p>
              <Link to="/dashboard/job-finder" className="pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)]">
                MARKETPLACE <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSubs.map(sub => {
                const company = getCompanyForSub(sub);
                const isExpiring = sub.status === 'expiring';
                const daysRemaining = Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24));
                const progressWidth = Math.max(0, Math.min(100, (daysRemaining / 30) * 100));

                return (
                  <Link 
                    key={sub.id} 
                    to={`/dashboard/job-finder/subscriptions/${sub.id}`}
                    className="block bento-card bg-white p-6 border border-black/5 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] transition-all group relative overflow-hidden"
                  >
                    {sub.newMatchesCount > 0 && (
                      <div className="absolute top-0 right-0 bg-[var(--color-accent-blue)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                        {sub.newMatchesCount} New Matches
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="h-12 w-12 rounded-full border border-black/10" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-black/5 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className="font-display text-2xl font-bold leading-none mb-1">{company.name}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${getSubscriptionStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-black/50">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Expiry</span>
                        <span>{formatDate(sub.expiresAt)}</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isExpiring ? 'bg-red-500' : 'bg-black'}`} 
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>
                      
                      {isExpiring && (
                        <div className="text-xs font-bold text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Ends in {daysRemaining} days
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-black/5 flex items-center text-sm font-bold uppercase tracking-widest text-black/40 group-hover:text-[var(--color-accent-blue)] transition-colors">
                      View Details <ArrowRight className="h-4 w-4 ml-auto" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
