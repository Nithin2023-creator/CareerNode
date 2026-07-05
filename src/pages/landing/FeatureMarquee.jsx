import React, { useState } from 'react';
import { Target, BarChart, Shield, Lock, RotateCcw, Clock } from 'lucide-react';

const features = [
  { text: "Auto Follow-Ups", icon: RotateCcw },
  { text: "Real-Time Tracking", icon: BarChart },
  { text: "Secure Data Storage", icon: Shield },
  { text: "One-Click Cancel", icon: Lock },
  { text: "24/7 Background Automation", icon: Clock },
  { text: "No Lock-In", icon: Target },
];

export default function FeatureMarquee() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="py-12 border-y border-black/10 bg-white overflow-hidden flex whitespace-nowrap">
      <div 
        className="marquee-track flex items-center hover:[animation-play-state:paused] cursor-default" 
        style={isPaused ? { animationPlayState: 'paused' } : undefined}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        data-cursor="hover"
      >
        {/* Duplicating the array to ensure a seamless infinite scroll */}
        {[...Array(4)].map((_, i) => (
          <React.Fragment key={i}>
            {features.map((feature, j) => {
              const Icon = feature.icon;
              return (
                <div key={`${i}-${j}`} className="flex items-center">
                  <div className="flex items-center gap-3 px-6">
                    <div className="bg-black/5 p-2 rounded-full">
                      <Icon className="h-5 w-5 text-black" />
                    </div>
                    <span className="font-display font-bold text-xl uppercase tracking-wide">
                      {feature.text}
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)] mx-4 shrink-0" />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
