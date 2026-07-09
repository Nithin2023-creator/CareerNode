import React from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, FileText, ArrowUpRight, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { features } from '../config/features';
import { membershipApi } from '../lib/api';

export default function DashboardPage() {
  const [myPlan, setMyPlan] = React.useState(null);

  React.useEffect(() => {
    membershipApi.getMe().then(res => setMyPlan(res)).catch(console.error);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <div className="space-y-10">
      {/* Header with Marquee */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <h1 className="font-display text-4xl xs:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-[0.85]">
            Welcome Back,<br/>Fresher.
          </h1>
          <div className="hidden md:block w-64 text-sm font-medium border-l border-black/10 pl-4">
            Your career acceleration hub. Automated job finding, cold emails, and ATS resumes.
          </div>
        </div>
        
        {/* Marquee Ticker */}
        <div className="bg-black/5 rounded-full overflow-hidden flex items-center py-3 relative">
          <div className="marquee-track space-x-6 pl-6 text-black/70 font-bold tracking-widest text-sm uppercase whitespace-nowrap">
            <span>🚀 12 NEW JOBS SCANNED TODAY</span>
            <span>•</span>
            <span>✨ 85% ATS MATCH RATE ACHIEVED</span>
            <span>•</span>
            <span>🔥 4 INTERVIEW TEMPLATES ADDED</span>
            <span>•</span>
            <span>🚀 12 NEW JOBS SCANNED TODAY</span>
            <span>•</span>
            <span>✨ 85% ATS MATCH RATE ACHIEVED</span>
            <span>•</span>
            <span>🔥 4 INTERVIEW TEMPLATES ADDED</span>
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]"
      >
        {/* Hero Bento - Job Finder */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-2 group cursor-pointer block p-8 lg:p-10 flex flex-col justify-between bg-white">
          <Link to="/dashboard/job-finder" className="absolute inset-0 z-10" />
          
          <div className="flex justify-between items-start z-10 relative">
            <div className="pill-badge bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
              LIVE SCANNER
            </div>
            <div className="h-14 w-14 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center text-black transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </div>
          
          <div className="z-10 relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-[24px] bg-[var(--color-accent-blue)] flex items-center justify-center shadow-[var(--shadow-soft)]">
                <Search className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-5xl md:text-7xl font-bold uppercase leading-[0.9] mb-4 text-black">Job<br/>Finder.</h2>
              <p className="text-lg md:text-xl font-medium max-w-sm text-black/70">Auto-scan career pages and extract best-fit roles using AI.</p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <div className="bg-white text-black rounded-[32px] px-6 py-4 flex flex-col w-32 shadow-[var(--shadow-soft)]">
                <span className="font-display font-bold text-4xl leading-none">245</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2 text-black/50">Jobs Matched</span>
              </div>
              <div className="bg-black text-white rounded-[32px] px-6 py-4 flex flex-col w-32 shadow-[var(--shadow-soft)]">
                <span className="font-display font-bold text-4xl leading-none">12</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2 text-white/50">Active Scans</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cold Emailer */}
        <motion.div variants={item} className="bento-card bg-white group cursor-pointer p-8 flex flex-col justify-between">
          <Link to="/dashboard/emailer" className="absolute inset-0 z-10" />
          <div className="flex justify-between items-start z-10 relative">
            <div className="pill-badge bg-[var(--color-accent-yellow)]/20 text-black">
              OUTREACH
            </div>
            <div className="h-12 w-12 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center text-black transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          
          <div className="z-10 relative">
            <div className="h-12 w-12 rounded-[16px] bg-[var(--color-accent-yellow)] flex items-center justify-center mb-4 shadow-[var(--shadow-soft)]">
              <Mail className="h-6 w-6 text-black" />
            </div>
            <h2 className="font-display text-4xl font-bold uppercase leading-[0.9] mb-2 text-black">Cold<br/>Mailer.</h2>
          </div>
        </motion.div>

        {/* Resume Maker */}
        <motion.div variants={item} className="bento-card bg-white group cursor-pointer p-8 flex flex-col justify-between">
          <Link to="/dashboard/resume-maker" className="absolute inset-0 z-10" />
          <div className="flex justify-between items-start z-10 relative">
            <div className="pill-badge bg-black/5 text-black">
              AI TAILOR
            </div>
            <div className="h-12 w-12 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center text-black transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          
          <div className="z-10 relative">
            <div className="h-12 w-12 rounded-[16px] bg-black flex items-center justify-center mb-4 shadow-[var(--shadow-soft)]">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-display text-4xl font-bold uppercase leading-[0.9] mb-2 text-black">Resume<br/>Maker.</h2>
          </div>
        </motion.div>

        {/* Automations */}
        <motion.div variants={item} className="bento-card bg-white group cursor-pointer p-8 flex flex-col justify-between">
          <Link to="/dashboard/automations" className="absolute inset-0 z-10" />
          <div className="flex justify-between items-start z-10 relative">
            <div className={`pill-badge ${features.automationsReleased ? 'bg-black/5 text-black' : 'bg-[var(--color-accent-yellow)]/20 text-black'}`}>
              {features.automationsReleased ? 'WORKFLOWS' : 'COMING SOON'}
            </div>
            <div className="h-12 w-12 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center text-black transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          
          <div className="z-10 relative">
            <div className="h-12 w-12 rounded-[16px] bg-black/5 flex items-center justify-center mb-4 shadow-[var(--shadow-soft)] border border-black/10">
              <Workflow className="h-6 w-6 text-black" />
            </div>
            <h2 className="font-display text-4xl font-bold uppercase leading-[0.9] mb-2 text-black">Visual<br/>Automations.</h2>
          </div>
        </motion.div>

        {/* Membership Status */}
        <motion.div variants={item} className="bento-card bg-white group cursor-pointer p-8 flex flex-col justify-between">
          <Link to="/dashboard/billing" className="absolute inset-0 z-10" />
          <div className="flex justify-between items-start z-10 relative">
            <div className="pill-badge bg-brand-primary/10 text-brand-primary">
              MEMBERSHIP
            </div>
            <div className="h-12 w-12 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center text-black transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          
          <div className="z-10 relative">
            <div className="h-12 w-12 rounded-[16px] bg-[var(--color-accent-blue)] flex items-center justify-center mb-4 shadow-[var(--shadow-soft)]">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-display text-4xl font-bold uppercase leading-[0.9] mb-2 text-black">
              {myPlan?.planId?.badge || 'FREE'}<br/>PLAN
            </h2>
            {myPlan?.planId?.tier === 'free' && (
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent-blue)] mt-2 inline-block hover:underline">
                Upgrade to Pro &rarr;
              </span>
            )}
          </div>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
