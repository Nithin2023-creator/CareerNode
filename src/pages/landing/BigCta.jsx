import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagneticButton from '../../components/interactive/MagneticButton';

export default function BigCta() {
  return (
    <section className="bg-black text-white py-40 px-4 md:px-8 mt-20 relative overflow-hidden rounded-t-[var(--radius-lg)] z-20">
      {/* Soft gradient background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <h2 className="font-display text-fluid-h2 lg:text-[120px] font-bold uppercase leading-[0.85] mb-12">
          STOP APPLYING.<br/>
          <span className="text-[var(--color-accent-yellow)]">START HACKING.</span>
        </h2>
        <MagneticButton>
          <Link to="/dashboard" className="inline-flex items-center justify-center px-12 py-6 bg-white text-black font-display font-bold text-2xl uppercase transition-all hover:bg-[var(--color-accent-blue)] hover:text-white hover:-translate-y-1 rounded-full gap-4 group shadow-[var(--shadow-soft)]" data-cursor="hover">
            ENTER THE NODE <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
          </Link>
        </MagneticButton>
        <div className="mt-16 flex flex-wrap justify-center gap-6 font-medium text-white/70">
          <div className="flex items-center gap-2"><CheckCircle2 className="text-[var(--color-accent-yellow)] h-5 w-5" /> <span>No Credit Card Required</span></div>
          <div className="flex items-center gap-2"><CheckCircle2 className="text-[var(--color-accent-yellow)] h-5 w-5" /> <span>Instant Access</span></div>
          <div className="flex items-center gap-2"><CheckCircle2 className="text-[var(--color-accent-yellow)] h-5 w-5" /> <span>Built for Freshers</span></div>
        </div>
      </div>
    </section>
  );
}
