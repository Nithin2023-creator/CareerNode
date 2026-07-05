import React from 'react';
import { Search, Mail, FileText, CheckCircle2, Zap, ShieldCheck, BarChart3, Clock, Users } from 'lucide-react';

export default function ToolkitDetail() {
  return (
    <section className="toolkit-section py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
      <div className="text-center mb-20">
        <div className="pill-badge bg-black/5 text-black mb-4 inline-block">THE PLATFORM</div>
        <h2 className="font-display text-fluid-h2 font-bold uppercase mb-4">The Toolkit.</h2>
      </div>

      <div className="bento-card bg-white border-2 border-black/10 overflow-hidden relative shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-black/10">
          
          {/* Job Finder */}
          <div className="toolkit-card p-8 md:p-10 group hover:bg-black/5 transition-colors">
            <div className="h-16 w-16 bg-[var(--color-accent-blue)] rounded-[20px] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-display text-3xl font-bold uppercase mb-6">Job Finder</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[var(--color-accent-blue)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Live career-page scanning for unlisted roles</span>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-[var(--color-accent-blue)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">AI match scoring based on your profile</span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[var(--color-accent-blue)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Credit-based a la carte unlocks</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[var(--color-accent-blue)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">30-day auto-renewing subscriptions</span>
              </div>
            </div>
          </div>

          {/* Cold Mailer */}
          <div className="toolkit-card p-8 md:p-10 group hover:bg-black/5 transition-colors">
            <div className="h-16 w-16 bg-[var(--color-accent-yellow)] rounded-[20px] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
              <Mail className="h-8 w-8 text-black" />
            </div>
            <h3 className="font-display text-3xl font-bold uppercase mb-6">Cold Mailer</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[var(--color-accent-yellow)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Verified HR contact bundles</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[var(--color-accent-yellow)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">AI-drafted personalized outreach emails</span>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-[var(--color-accent-yellow)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Detailed campaign delivery tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-[var(--color-accent-yellow)] mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Wallet-based ecosystem credits</span>
              </div>
            </div>
          </div>

          {/* Resume Maker */}
          <div className="toolkit-card p-8 md:p-10 group hover:bg-black/5 transition-colors">
            <div className="h-16 w-16 bg-black rounded-[20px] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-display text-3xl font-bold uppercase mb-6">Resume Maker</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-black/50 mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Upload your static base resume securely</span>
              </div>
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-black/50 mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Paste job description for targeted analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-black/50 mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">AI ATS-keyword tailoring & optimization</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-black/50 mt-0.5 shrink-0" />
                <span className="text-black/70 font-medium text-sm leading-snug">Instant export to PDF or DOCX format</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
