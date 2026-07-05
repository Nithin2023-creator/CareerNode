import React, { useEffect, useState } from 'react';
import { Search, Filter, PackageOpen } from 'lucide-react';
import { bundlesApi } from '../../lib/api';
import { withMockFallback } from '../../lib/apiHelpers';
import BundleProductCard from '../../components/cold-mailer/BundleProductCard';

export default function HrMarketplacePage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const res = await withMockFallback(bundlesApi.listBundles(), []);
        setBundles(res);
      } catch (e) {
        console.error('Failed to load bundles:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const filteredBundles = bundles.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="space-y-6">
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
          HR <span className="text-[var(--color-accent-yellow)]">Marketplace</span>
        </h1>
        <p className="text-base md:text-xl text-black/60 max-w-2xl leading-relaxed">
          Supercharge your cold outreach with curated, verified contact bundles of technical recruiters and HR decision-makers.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-[30px] border border-black/5 shadow-sm">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bundles (e.g. SaaS, India, Startup)"
            className="w-full bg-black/5 rounded-full pl-12 pr-6 py-3 font-medium placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-yellow)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="bento-button bg-black text-white hover:bg-black/90 whitespace-nowrap">
          <Filter className="w-4 h-4 mr-2" />
          Categories
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bento-card p-6 h-80 bg-white/50 animate-pulse border border-black/5" />
          ))}
        </div>
      ) : filteredBundles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBundles.map(bundle => (
            <BundleProductCard key={bundle._id} bundle={bundle} />
          ))}
        </div>
      ) : (
        <div className="bento-card p-16 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center border border-black/5">
          <PackageOpen className="h-16 w-16 text-black/20 mb-4" />
          <h3 className="font-display text-3xl font-bold uppercase mb-2">No Bundles Found</h3>
          <p className="text-black/60 text-lg">Try adjusting your search criteria or check back later.</p>
        </div>
      )}
    </div>
  );
}
