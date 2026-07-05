import React from 'react';
import { Workflow, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AutomationsTeaser() {
  return (
    <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
      <Link 
        to="/dashboard/automations" 
        className="automations-teaser bento-card bg-[var(--color-accent-yellow)] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:-translate-y-1 transition-transform shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-center gap-6 text-black">
          <div className="h-12 w-12 rounded-[16px] bg-black/10 flex items-center justify-center shrink-0">
            <Workflow className="h-6 w-6 text-black" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <div className="pill-badge bg-black/10 text-black !py-1 !px-3 shrink-0">COMING SOON</div>
              <h3 className="font-display font-bold uppercase text-base sm:text-xl">Visual Automations</h3>
            </div>
            <p className="font-medium text-black/80 text-sm">
              Wire Job Finder → Resume Maker → Cold Mailer into one seamless flow.
            </p>
          </div>
        </div>
        <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center text-[var(--color-accent-yellow)] shrink-0 group-hover:scale-110 transition-transform">
          <ArrowRight className="h-5 w-5" />
        </div>
      </Link>
    </section>
  );
}
