import React from 'react';
import { Store, Wallet, Clock, Bell } from 'lucide-react';

export default function JobFinderIntro({ onDismiss }) {
  return (
    <div className="bento-card bg-[var(--color-background)] border-2 border-black/10 overflow-hidden relative">
      <div className="p-8 md:p-12 border-b border-black/10 bg-white/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
              How Job Finder Works
            </h2>
            <p className="text-black/60 font-medium text-lg leading-relaxed">
              Skip the noise. Browse our marketplace of top companies, subscribe to the ones you want to join, and let our system automatically match your profile with new roles the moment they're posted.
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] transition-colors whitespace-nowrap self-start md:self-auto"
            >
              GOT IT
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/10 bg-white">
        {/* Step 1 */}
        <div className="p-8 hover:bg-black/5 transition-colors group">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-4xl font-bold text-black/10 group-hover:text-black/20 transition-colors">01</span>
            <div className="h-12 w-12 rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] flex items-center justify-center">
              <Store className="h-6 w-6" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold uppercase mb-3">Browse Companies</h3>
          <p className="text-black/50 font-medium text-sm leading-relaxed">
            Explore companies like Stripe, Vercel, and OpenAI. See open-role counts before you commit.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-8 hover:bg-black/5 transition-colors group">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-4xl font-bold text-black/10 group-hover:text-black/20 transition-colors">02</span>
            <div className="h-12 w-12 rounded-full bg-[var(--color-accent-yellow)]/20 text-black flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold uppercase mb-3">Subscribe Your Way</h3>
          <p className="text-black/50 font-medium text-sm leading-relaxed">
            Pay with credits from your wallet, or go a-la-carte with a one-time payment. No recurring lock-in.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-8 hover:bg-black/5 transition-colors group">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-4xl font-bold text-black/10 group-hover:text-black/20 transition-colors">03</span>
            <div className="h-12 w-12 rounded-full bg-black/5 text-black flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold uppercase mb-3">30 Days Of Coverage</h3>
          <p className="text-black/50 font-medium text-sm leading-relaxed">
            Every subscription actively watches that company's careers page for a full 30 days from purchase.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-8 hover:bg-black/5 transition-colors group">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-4xl font-bold text-black/10 group-hover:text-black/20 transition-colors">04</span>
            <div className="h-12 w-12 rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold uppercase mb-3">Matched & Notified</h3>
          <p className="text-black/50 font-medium text-sm leading-relaxed">
            New postings are checked against your Match Profile automatically — you only hear about real fits, the moment they're posted.
          </p>
        </div>
      </div>
    </div>
  );
}
