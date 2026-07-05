import React from 'react';
import { UserPlus, Sparkles, HeartHandshake } from 'lucide-react';
import { useTilt } from '../../hooks/useTilt';

function PillarCard({ icon: Icon, title, description, className, iconWrapperClass, iconClass, titleClass, descClass, bgColor }) {
  const tiltRef = useTilt({ maxTilt: 5, scale: 1.02 });
  
  return (
    <div ref={tiltRef} className={`brand-pillar bento-card group ${className}`} style={{ backgroundColor: bgColor }} data-cursor="hover">
      <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${iconWrapperClass}`}>
        <Icon className={`h-6 w-6 ${iconClass}`} />
      </div>
      <h3 className={`font-display text-2xl font-bold uppercase mb-4 ${titleClass}`}>{title}</h3>
      <p className={`font-medium leading-relaxed ${descClass}`}>
        {description}
      </p>
    </div>
  );
}

export default function BrandPillars() {
  return (
    <section id="about" className="brand-pillars-section scroll-mt-28 py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
      <div className="text-center mb-20">
        <div className="pill-badge bg-black/5 text-black mb-4 inline-block">WHY CAREERNODE</div>
        <h2 className="font-display text-fluid-h2 font-bold uppercase mb-4">Our Pillars.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PillarCard 
          icon={UserPlus}
          title="Built For Freshers"
          description="No jargon. No complex filters. Just straight-forward tools designed specifically to help you land your first role without the usual headache."
          className="p-8 md:p-10"
          bgColor="var(--color-accent-yellow)"
          iconWrapperClass="bg-black/10"
          iconClass="text-black"
          titleClass="text-black"
          descClass="text-black/70"
        />

        <PillarCard 
          icon={Sparkles}
          title="Automation, Not Noise"
          description="We don't spam you with irrelevant job alerts. Our AI agents work quietly in the background to bring you only high-quality, matched opportunities."
          className="border border-black/10 shadow-[var(--shadow-soft)] p-8 md:p-10"
          bgColor="#ffffff"
          iconWrapperClass="bg-black/5"
          iconClass="text-black"
          titleClass=""
          descClass="text-black/60"
        />

        <PillarCard 
          icon={HeartHandshake}
          title="We've Got Your Back"
          description="Transparent pricing, robust support, and absolutely no lock-in. We succeed when you get hired. It's that simple."
          className="p-8 md:p-10 text-white"
          bgColor="var(--color-accent-blue)"
          iconWrapperClass="bg-white/20"
          iconClass="text-white"
          titleClass="text-white"
          descClass="text-white/80"
        />
      </div>
    </section>
  );
}
