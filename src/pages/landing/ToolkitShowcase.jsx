import React, { useRef, useEffect, useState } from 'react';
import { Search, Mail, FileText, CheckCircle2, Zap, ShieldCheck, BarChart3, Clock, Users } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTilt } from '../../hooks/useTilt';
import { refreshScrollTrigger } from '../../lib/lenisScroll';

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    id: 'job-finder',
    title: 'Job Finder',
    icon: Search,
    color: 'var(--color-accent-blue)',
    iconColor: 'text-white',
    bullets: [
      { icon: CheckCircle2, text: 'Live career-page scanning for unlisted roles' },
      { icon: Zap, text: 'AI match scoring based on your profile' },
      { icon: ShieldCheck, text: 'Credit-based a la carte unlocks' },
      { icon: Clock, text: '30-day auto-renewing subscriptions' },
    ],
  },
  {
    id: 'cold-mailer',
    title: 'Cold Mailer',
    icon: Mail,
    color: 'var(--color-accent-yellow)',
    iconColor: 'text-black',
    bullets: [
      { icon: Users, text: 'Verified HR contact bundles' },
      { icon: FileText, text: 'AI-drafted personalized outreach emails' },
      { icon: BarChart3, text: 'Detailed campaign delivery tracking' },
      { icon: Zap, text: 'Wallet-based ecosystem credits' },
    ],
  },
  {
    id: 'resume-maker',
    title: 'Resume Maker',
    icon: FileText,
    color: '#000000',
    iconColor: 'text-white',
    bullets: [
      { icon: CheckCircle2, text: 'Upload your static base resume securely' },
      { icon: Search, text: 'Paste job description for targeted analysis' },
      { icon: Zap, text: 'AI ATS-keyword tailoring & optimization' },
      { icon: FileText, text: 'Instant export to PDF or DOCX format' },
    ],
  },
];

export default function ToolkitShowcase() {
  const containerRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const tiltRef1 = useTilt({ maxTilt: 5 });
  const tiltRef2 = useTilt({ maxTilt: 5 });
  const tiltRef3 = useTilt({ maxTilt: 5 });

  const tiltRefs = [tiltRef1, tiltRef2, tiltRef3];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const panels = gsap.utils.toArray('.showcase-text-block');

        gsap.set(panels.slice(1), { opacity: 0, y: 20 });
        gsap.set(panels[0], { opacity: 1, y: 0 });

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            let index = 0;
            if (progress >= 0.33 && progress < 0.66) index = 1;
            if (progress >= 0.66) index = 2;

            if (activeIndexRef.current === index) return;

            const prev = activeIndexRef.current;
            activeIndexRef.current = index;

            gsap.to(panels[prev], { opacity: 0, y: -20, duration: 0.3 });
            gsap.fromTo(
              panels[index],
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, delay: 0.1 }
            );
            setActiveIndex(index);
          },
        });
      });
    }, containerRef);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => refreshScrollTrigger());
    });
    const timer = setTimeout(() => refreshScrollTrigger(), 600);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <section id="toolkit" ref={containerRef} className="toolkit-section relative z-20 bg-[var(--color-background)] w-full">
      {/* Desktop Layout (Pinned) */}
      <div className="hidden lg:flex h-screen max-w-7xl mx-auto px-8 items-center">
        {/* Left Text Column */}
        <div className="w-1/2 pr-16 relative h-[60vh] flex flex-col justify-center">
          <div className="mb-12 absolute top-0">
            <div className="pill-badge bg-black/5 text-black mb-4 inline-block">THE PLATFORM</div>
            <h2 className="font-display text-fluid-h3 font-bold uppercase">The Toolkit.</h2>
          </div>

          <div className="relative w-full h-[300px] mt-16">
            {chapters.map((chapter, i) => (
              <div
                key={chapter.id}
                className="showcase-text-block absolute top-0 left-0 w-full"
                style={{ opacity: i === 0 ? 1 : 0, pointerEvents: activeIndex === i ? 'auto' : 'none' }}
              >
                <h3 className="font-display text-4xl font-bold uppercase mb-8">{chapter.title}</h3>
                <div className="space-y-6">
                  {chapter.bullets.map((bullet, j) => {
                    const Icon = bullet.icon;
                    return (
                      <div key={j} className="flex items-start gap-4">
                        <Icon
                          className="h-6 w-6 mt-0.5 shrink-0"
                          style={{ color: chapter.color === '#000000' ? 'rgba(0,0,0,0.5)' : chapter.color }}
                        />
                        <span className="text-black/80 font-medium text-lg leading-snug">{bullet.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual Panel */}
        <div className="w-1/2 relative h-[80vh] flex items-center justify-center">
          {/* Progress Rail */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-10">
            {chapters.map((_, i) => (
              <div
                key={i}
                className={`w-1 transition-all duration-300 rounded-full ${activeIndex === i ? 'h-16 bg-black' : 'h-8 bg-black/10'}`}
              />
            ))}
          </div>

          {/* Bento Card Visuals — outer handles scroll transition, inner handles tilt */}
          <div className="relative w-full max-w-md h-[500px] ml-12">
            {chapters.map((chapter, i) => {
              const Icon = chapter.icon;
              const isActive = activeIndex === i;
              return (
                <div
                  key={chapter.id}
                  className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateY(${isActive ? '0' : activeIndex < i ? '40px' : '-40px'}) scale(${isActive ? 1 : 0.95})`,
                    pointerEvents: isActive ? 'auto' : 'none',
                    zIndex: isActive ? 10 : 0,
                  }}
                >
                  <div
                    ref={tiltRefs[i]}
                    className="w-full h-full bento-card bg-white border border-black/10 flex flex-col items-center justify-center p-12"
                    data-cursor="hover"
                  >
                    <div
                      className="h-24 w-24 rounded-3xl flex items-center justify-center mb-8 shadow-sm transition-transform duration-500 hover:scale-110"
                      style={{ backgroundColor: chapter.color }}
                    >
                      <Icon className={`h-12 w-12 ${chapter.iconColor}`} />
                    </div>
                    <div className="w-full h-auto bg-black/5 rounded-2xl border border-black/5 p-4 flex flex-col gap-3">
                      {chapter.id === 'job-finder' && (
                        <>
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-black/5">
                            <div className="flex flex-col">
                              <span className="text-xs text-black/50 font-bold uppercase tracking-wider">New Roles</span>
                              <span className="text-lg font-display font-bold">+124 Matches</span>
                            </div>
                            <div className="h-10 w-10 bg-[var(--color-accent-blue)]/10 rounded-full flex items-center justify-center text-[var(--color-accent-blue)]"><Search className="w-5 h-5"/></div>
                          </div>
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-black/5">
                            <div className="flex flex-col">
                              <span className="text-xs text-black/50 font-bold uppercase tracking-wider">AI Score</span>
                              <span className="text-lg font-display font-bold text-green-600">98% Fit</span>
                            </div>
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Zap className="w-5 h-5"/></div>
                          </div>
                        </>
                      )}
                      {chapter.id === 'cold-mailer' && (
                        <>
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-black/5">
                            <div className="flex flex-col">
                              <span className="text-xs text-black/50 font-bold uppercase tracking-wider">Campaign</span>
                              <span className="text-lg font-display font-bold">HR Outreach</span>
                            </div>
                            <div className="h-10 w-10 bg-[var(--color-accent-yellow)]/20 rounded-full flex items-center justify-center text-yellow-600"><Mail className="w-5 h-5"/></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-black/5 flex flex-col items-center">
                              <span className="text-xl font-display font-bold">84%</span>
                              <span className="text-[10px] text-black/50 font-bold uppercase tracking-wider">Open Rate</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-black/5 flex flex-col items-center">
                              <span className="text-xl font-display font-bold">12%</span>
                              <span className="text-[10px] text-black/50 font-bold uppercase tracking-wider">Reply Rate</span>
                            </div>
                          </div>
                        </>
                      )}
                      {chapter.id === 'resume-maker' && (
                        <>
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-black/5">
                            <div className="flex flex-col">
                              <span className="text-xs text-black/50 font-bold uppercase tracking-wider">ATS Scan</span>
                              <span className="text-lg font-display font-bold text-black">Passed</span>
                            </div>
                            <div className="h-10 w-10 bg-black/10 rounded-full flex items-center justify-center text-black"><CheckCircle2 className="w-5 h-5"/></div>
                          </div>
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-black/5">
                            <div className="flex flex-col">
                              <span className="text-xs text-black/50 font-bold uppercase tracking-wider">Keywords</span>
                              <span className="text-lg font-display font-bold text-black">15 Optimized</span>
                            </div>
                            <div className="h-10 w-10 bg-black/10 rounded-full flex items-center justify-center text-black"><FileText className="w-5 h-5"/></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Layout (Stacked, standard scrolling) */}
      <div className="lg:hidden py-24 px-4 md:px-8 max-w-xl mx-auto">
        <div className="text-center mb-16">
          <div className="pill-badge bg-black/5 text-black mb-4 inline-block">THE PLATFORM</div>
          <h2 className="font-display text-fluid-h2 font-bold uppercase mb-4">The Toolkit.</h2>
        </div>

        <div className="space-y-12">
          {chapters.map((chapter) => {
            const Icon = chapter.icon;
            return (
              <div key={chapter.id} className="bento-card bg-white border border-black/10 p-8 shadow-[var(--shadow-soft)] toolkit-card">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                  style={{ backgroundColor: chapter.color }}
                >
                  <Icon className={`h-8 w-8 ${chapter.iconColor}`} />
                </div>
                <h3 className="font-display text-2xl font-bold uppercase mb-6">{chapter.title}</h3>
                <div className="space-y-4">
                  {chapter.bullets.map((bullet, j) => {
                    const BulletIcon = bullet.icon;
                    return (
                      <div key={j} className="flex items-start gap-3">
                        <BulletIcon
                          className="h-5 w-5 mt-0.5 shrink-0"
                          style={{ color: chapter.color === '#000000' ? 'rgba(0,0,0,0.5)' : chapter.color }}
                        />
                        <span className="text-black/80 font-medium text-sm leading-snug">{bullet.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
