import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthForm from '../../components/auth/AuthForm';
import HouseIcon from '../../components/interactive/HouseIcon';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col lg:flex-row">
      
      {/* Mobile Top Strip (collapses Brand Panel on small screens) */}
      <div className="lg:hidden p-4 flex items-center justify-between border-b border-black/5 bg-white/50 backdrop-blur-sm z-10 sticky top-0">
        <Link to="/" className="flex items-center gap-2 text-black/60 hover:text-black font-bold tracking-widest text-xs uppercase transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <div className="flex items-center gap-1 font-display font-bold lowercase leading-none text-xl">
          career node <HouseIcon className="w-3 h-3 ml-0.5" />
        </div>
      </div>

      {/* Left Brand Panel (visible on lg+) */}
      <div className="hidden lg:flex w-[45%] bg-[#1a1a1a] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Pixel Pattern Background (reused logic from grid-brand-bg but dark mode native) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        
        {/* Top Left Home Link */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white font-bold tracking-widest text-xs uppercase transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>

        {/* Center Brand */}
        <div className="relative z-10 my-auto py-12">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <HouseIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold uppercase tracking-tight text-6xl leading-[1.1] mb-6">
            Hack the<br />
            <span className="text-[var(--color-accent-blue)]">Job Hunt.</span>
          </h1>
          
          <div className="flex flex-col gap-4 mt-12 max-w-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-yellow)] shrink-0 mt-0.5" />
              <p className="text-white/70 font-medium leading-relaxed">AI-matched job scans running quietly in the background.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-blue)] shrink-0 mt-0.5" />
              <p className="text-white/70 font-medium leading-relaxed">Cold email automation to hiring managers directly.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-yellow)] shrink-0 mt-0.5" />
              <p className="text-white/70 font-medium leading-relaxed">ATS-ready resumes generated instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 py-12 lg:p-12 relative">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bento-card bg-white p-8 md:p-10 w-full shadow-xl">
            <div className="mb-8 text-center lg:text-left hidden lg:block">
              <h2 className="font-display font-bold lowercase leading-none tracking-tight text-black text-3xl mb-2 flex items-center gap-1">
                welcome back
                <span className="w-2 h-2 bg-black rounded-full mb-0.5 ml-0.5" />
              </h2>
              <p className="text-black/50 font-medium text-sm">
                Sign in to your dashboard to continue.
              </p>
            </div>
            
            <div className="mb-8 text-center lg:hidden">
              <h2 className="font-display font-bold lowercase leading-none tracking-tight text-black text-3xl mb-2">
                welcome back
              </h2>
              <p className="text-black/50 font-medium text-sm">
                Sign in to your dashboard to continue.
              </p>
            </div>

            <AuthForm />
          </div>
        </div>
      </div>

    </div>
  );
}
