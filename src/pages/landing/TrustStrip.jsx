import React from 'react';
import { CreditCard, Play, User, Clock } from 'lucide-react';

export default function TrustStrip() {
  return (
    <section className="trust-strip py-8 px-4 md:px-8 border-b border-black/5 bg-white relative z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 md:gap-8">
        <div className="trust-badge bg-black/5 text-black px-6 py-3 rounded-full font-bold tracking-widest uppercase text-xs md:text-sm flex items-center gap-2 shadow-sm hover:-translate-y-0.5 transition-transform">
          <CreditCard className="h-4 w-4 text-black/50" /> NO CREDIT CARD REQUIRED
        </div>
        <div className="trust-badge bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] px-6 py-3 rounded-full font-bold tracking-widest uppercase text-xs md:text-sm flex items-center gap-2 shadow-sm hover:-translate-y-0.5 transition-transform">
          <Play className="h-4 w-4" /> FREE TO START
        </div>
        <div className="trust-badge bg-[var(--color-accent-yellow)]/20 text-black px-6 py-3 rounded-full font-bold tracking-widest uppercase text-xs md:text-sm flex items-center gap-2 shadow-sm hover:-translate-y-0.5 transition-transform">
          <User className="h-4 w-4 text-[var(--color-accent-yellow)]" /> BUILT FOR FRESHERS
        </div>
        <div className="trust-badge bg-black/5 text-black px-6 py-3 rounded-full font-bold tracking-widest uppercase text-xs md:text-sm flex items-center gap-2 shadow-sm hover:-translate-y-0.5 transition-transform">
          <Clock className="h-4 w-4 text-black/50" /> SETUP IN 5 MINUTES
        </div>
      </div>
    </section>
  );
}
