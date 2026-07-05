import React from 'react';
import { LogIn, Search, FileEdit, Trophy } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: LogIn,
      title: "Sign Up",
      desc: "Create your free account and upload your base fresher profile in minutes."
    },
    {
      icon: Search,
      title: "Auto-Scan & Match",
      desc: "Our AI agent crawls company career pages and flags roles matching your exact skills."
    },
    {
      icon: FileEdit,
      title: "AI Tailors Resumes",
      desc: "Instantly generate an ATS-optimized resume and personalized cold email."
    },
    {
      icon: Trophy,
      title: "Land The Offer",
      desc: "Track your outreach campaigns and bypass the manual application fatigue."
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section scroll-mt-28 py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
      <div className="text-center mb-20">
        <div className="pill-badge bg-black/5 text-black mb-4 inline-block">THE PROCESS</div>
        <h2 className="font-display text-fluid-h2 font-bold uppercase mb-4">How It Works.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4">
        {steps.map((step, i) => (
          <div key={i} className="how-it-works-step flex flex-col items-center text-center group relative">
            <div className="flex items-center justify-center w-full mb-8 relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-[50%] w-full h-[2px] bg-black/5 z-0 transform -translate-y-1/2"></div>
              )}
              <div className="h-20 w-20 bg-white rounded-[24px] flex items-center justify-center shadow-lg border-2 border-black/5 relative z-10 group-hover:scale-110 transition-transform group-hover:border-black/20">
                <step.icon className="h-8 w-8 text-black" />
              </div>
            </div>
            <div className="pill-badge bg-black text-white mb-4">0{i + 1}</div>
            <h3 className="font-display text-xl font-bold uppercase mb-3">{step.title}</h3>
            <p className="text-black/60 font-medium text-sm leading-relaxed px-4">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
