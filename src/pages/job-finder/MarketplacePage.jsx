import React, { useEffect, useState } from 'react';
import { Search, Filter, Store } from 'lucide-react';
import { jobFinderApi } from '../../lib/api';
import { withMockFallback, hasSeenJobFinderIntro } from './helpers';
import { mockSubscriptions } from './mockData';
import CompanyProductCard from '../../components/job-finder/CompanyProductCard';
import JobFinderIntro from '../../components/job-finder/JobFinderIntro';
import { useIntroVisibility } from './IntroVisibilityContext';

export default function MarketplacePage() {
  const [companies, setCompanies] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showIntro, setShowIntro] = useState(() => !hasSeenJobFinderIntro());
  const [displayedCount, setDisplayedCount] = useState(12);
  const { setInlineIntroOpen, registerIntroDismiss, dismissIntro } = useIntroVisibility();

  useEffect(() => {
    setDisplayedCount(12);
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    registerIntroDismiss(() => setShowIntro(false));
  }, [registerIntroDismiss]);

  // Only hide the header "How It Works" button when the inline intro is visible (md+).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setInlineIntroOpen(showIntro && mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      setInlineIntroOpen(false);
    };
  }, [showIntro, setInlineIntroOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const comps = await jobFinderApi.listMarketplaceCompanies();
        const subs = await withMockFallback(jobFinderApi.listSubscriptions(), mockSubscriptions);
        setCompanies(comps || []);
        setSubscriptions(subs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = ['All', ...new Set(companies.map(c => c.category))];
  const activeSubCompanyIds = subscriptions.filter(s => s.status === 'active' || s.status === 'expiring').map(s => s.companyId);

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const visibleCompanies = filteredCompanies.slice(0, displayedCount);

  if (loading) {
    return (
      <div className="space-y-8">
        {showIntro && (
          <div className="hidden md:block">
            <JobFinderIntro onDismiss={dismissIntro} />
          </div>
        )}
        <div className="p-8 text-black/40 font-bold uppercase tracking-widest text-sm">Loading Marketplace...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showIntro && (
        <div className="hidden md:block">
          <JobFinderIntro onDismiss={dismissIntro} />
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md py-3 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border border-black/5 md:rounded-[32px]">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
            <input 
              type="text" 
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-full pl-12 pr-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
            />
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            <Filter className="h-5 w-5 text-black/40 mr-2 hidden md:block shrink-0 mt-2" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shrink-0 ${
                  activeCategory === cat 
                    ? 'bg-black text-white' 
                    : 'bg-white border border-black/10 text-black/60 hover:border-black/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="bento-card p-16 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center border border-black/5">
          <Store className="h-16 w-16 text-black/20 mb-4" />
          <h3 className="font-display text-3xl font-bold uppercase mb-2">No Companies Found</h3>
          <p className="text-black/50 font-medium">Try adjusting your search or category filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleCompanies.map(company => (
              <CompanyProductCard 
                key={company.id} 
                company={company} 
                isSubscribed={activeSubCompanyIds.includes(company.id)} 
              />
            ))}
          </div>
          
          {displayedCount < filteredCompanies.length && (
            <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-4">
              <span className="pill-badge bg-black/5 text-black/60">
                SHOWING {visibleCompanies.length} OF {filteredCompanies.length} COMPANIES
              </span>
              <button 
                onClick={() => setDisplayedCount(prev => prev + 12)}
                className="pill-btn-secondary"
              >
                LOAD MORE
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
