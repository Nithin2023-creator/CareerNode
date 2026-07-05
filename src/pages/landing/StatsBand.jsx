import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

function StatItem({ value, label, prefix = "", suffix = "" }) {
  const ref = useCountUp(value, { duration: 2.5, prefix, suffix });
  
  return (
    <div className="stats-item flex flex-col items-center">
      <h3 ref={ref} className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight text-black mb-2">
        0
      </h3>
      <p className="text-black/50 font-bold text-[10px] md:text-xs tracking-widest uppercase">
        {label}
      </p>
    </div>
  );
}

export default function StatsBand() {
  const stats = [
    { value: 12400, label: "Jobs Auto-Scanned", suffix: "+" },
    { value: 3.2, label: "Faster Replies", suffix: "x" },
    { value: 85, label: "Avg ATS Match", suffix: "%" },
    { value: 500, label: "Freshers Onboarded", suffix: "+" }
  ];

  return (
    <section id="stats" className="stats-section scroll-mt-28 py-24 px-4 md:px-8 border-y border-black/5 bg-white relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {stats.map((stat, idx) => (
          <StatItem key={idx} {...stat} />
        ))}
      </div>
    </section>
  );
}
