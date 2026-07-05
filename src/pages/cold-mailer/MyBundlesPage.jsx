import React, { useEffect, useState } from 'react';
import { Package, Send, CalendarDays, ExternalLink } from 'lucide-react';
import { bundlesApi } from '../../lib/api';
import { withMockFallback, formatDate } from '../../lib/apiHelpers';
import { useNavigate } from 'react-router-dom';

export default function MyBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchased = async () => {
      try {
        const res = await withMockFallback(bundlesApi.listPurchasedBundles(), []);
        setBundles(res);
      } catch (e) {
        console.error('Failed to load purchased bundles', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchased();
  }, []);

  const handleUseInCampaign = (bundleId) => {
    navigate('/dashboard/emailer/campaigns/new', { state: { preselectBundleId: bundleId } });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="space-y-6">
        <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight">
          My <span className="text-[var(--color-accent-blue)]">Bundles</span>
        </h1>
        <p className="text-xl text-black/60 max-w-2xl leading-relaxed">
          Manage your purchased HR contact bundles and launch outreach campaigns directly to verified decision-makers.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bento-card p-6 h-64 bg-white/50 animate-pulse border border-black/5" />
          ))}
        </div>
      ) : bundles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map(bundle => (
            <div key={bundle._id} className="bento-card p-6 bg-white flex flex-col h-full border border-black/5 hover:border-black/20 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase mb-1">{bundle.name}</h3>
                  <span className="text-sm bg-black/5 px-2 py-1 rounded-md text-black/60 inline-flex items-center font-medium">
                    <Package className="w-3 h-3 mr-1" />
                    {bundle.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex justify-between items-center py-2 border-b border-black/5">
                  <span className="text-black/60 text-sm font-medium">Contacts</span>
                  <span className="font-bold">{bundle.contactCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-black/5">
                  <span className="text-black/60 text-sm font-medium">Purchased</span>
                  <span className="font-bold text-sm flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 opacity-50" />
                    {formatDate(bundle.purchasedAt)}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-black/5 flex flex-col gap-3">
                <button 
                  onClick={() => handleUseInCampaign(bundle._id)}
                  className="bento-button w-full justify-center bg-[var(--color-accent-blue)] text-white hover:bg-[var(--color-accent-blue)]/90 shadow-md"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Use in Campaign
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bento-card p-16 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center border border-black/5">
          <Package className="h-16 w-16 text-black/20 mb-4" />
          <h3 className="font-display text-3xl font-bold uppercase mb-2">No Bundles Yet</h3>
          <p className="text-black/60 text-lg mb-8 max-w-md">
            You haven't purchased any contact bundles yet. Visit the marketplace to discover verified HR contacts.
          </p>
          <button 
            onClick={() => navigate('/dashboard/emailer/marketplace')}
            className="bento-button bg-[var(--color-accent-yellow)] text-black"
          >
            Explore Marketplace
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}
