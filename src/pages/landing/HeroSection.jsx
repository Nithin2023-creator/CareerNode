import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import MagneticButton from '../../components/interactive/MagneticButton';

export default function HeroSection() {
  const heroRef = useRef(null);
  const glowRef = useRef(null);
  const b1Ref = useRef(null);
  const b2Ref = useRef(null);
  const b3Ref = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isTouch || prefersReducedMotion || !glowRef.current || !heroRef.current) return;

    const xTo = gsap.quickTo(glowRef.current, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(glowRef.current, "y", { duration: 0.6, ease: "power3" });

    const b1X = gsap.quickTo(b1Ref.current, "x", { duration: 1, ease: "power3.out" });
    const b1Y = gsap.quickTo(b1Ref.current, "y", { duration: 1, ease: "power3.out" });
    const b2X = gsap.quickTo(b2Ref.current, "x", { duration: 1.2, ease: "power3.out" });
    const b2Y = gsap.quickTo(b2Ref.current, "y", { duration: 1.2, ease: "power3.out" });
    const b3X = gsap.quickTo(b3Ref.current, "x", { duration: 0.8, ease: "power3.out" });
    const b3Y = gsap.quickTo(b3Ref.current, "y", { duration: 0.8, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Center the glow (assuming 600x600 glow)
      xTo(x - 300);
      yTo(y - 300);

      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      // Subtly move towards cursor
      b1X(normX * 30);
      b1Y(normY * 30);
      
      b2X(normX * 45);
      b2Y(normY * 45);
      
      b3X(normX * 20);
      b3Y(normY * 20);
    };

    const section = heroRef.current;
    section.addEventListener('mousemove', handleMouseMove);

    gsap.set(glowRef.current, { x: -300, y: -300, opacity: 0 });
    gsap.to(glowRef.current, { opacity: 1, duration: 1.2, delay: 0.5, ease: 'power2.out' });

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section id="hero" ref={heroRef} className="hero-section min-h-[100svh] relative flex flex-col justify-center items-center pt-24 pb-20 px-4 md:px-8 overflow-hidden bg-[var(--color-background)]">
      {/* Cursor Spotlight */}
      <div 
        ref={glowRef}
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-[var(--color-accent-blue)]/15 rounded-full blur-[100px] pointer-events-none hidden lg:block z-0 mix-blend-multiply opacity-0"
      />

      {/* Floating Badges */}
      <div className="parallax-badge-1 absolute top-[20%] left-[10%] hidden lg:block z-0">
        <div ref={b1Ref} className="bg-white/80 backdrop-blur-sm text-black shadow-[var(--shadow-soft)] text-sm px-6 py-3 rounded-full font-bold tracking-widest uppercase">LIVE SCANS</div>
      </div>
      <div className="parallax-badge-2 absolute top-[30%] right-[10%] hidden lg:block z-0">
        <div ref={b2Ref} className="bg-white/80 backdrop-blur-sm text-black shadow-[var(--shadow-soft)] text-sm px-6 py-3 rounded-full font-bold tracking-widest uppercase">COLD EMAILS</div>
      </div>
      <div className="parallax-badge-3 absolute bottom-[30%] left-[15%] hidden lg:block z-0">
        <div ref={b3Ref} className="bg-white/80 backdrop-blur-sm text-black shadow-[var(--shadow-soft)] text-sm px-6 py-3 rounded-full font-bold tracking-widest uppercase">ATS RESUMES</div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
        <div>
          <h1 className="hero-headline font-display text-fluid-hero font-bold tracking-tight uppercase text-black mb-8 opacity-0">
            Hack The<br/>
            <span className="text-[var(--color-accent-blue)]">Job Hunt.</span>
          </h1>
          <p className="hero-subtext font-body text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-12 text-black/70 opacity-0">
            Automated job finding, AI cold emails, and instant ATS resumes for the modern fresher.
          </p>
        </div>
        
        <div className="hero-cta flex flex-col sm:flex-row items-center gap-4 z-20 opacity-0">
          <MagneticButton>
            <Link to="/dashboard" className="pill-btn text-lg md:text-xl px-10 py-5 group" data-cursor="hover">
              OPEN DASHBOARD <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </MagneticButton>
          <MagneticButton>
            <a href="#how-it-works" className="pill-btn-secondary bg-transparent hover:bg-black/5 border border-black/20 text-lg md:text-xl px-10 py-5 transition-colors" data-cursor="hover">
              SEE HOW IT WORKS
            </a>
          </MagneticButton>
        </div>
      </div>

      {/* Infinite Marquee */}
      <div className="hero-marquee absolute bottom-8 w-full bg-white/50 backdrop-blur-sm py-4 overflow-hidden z-10 border-y border-black/5">
        <div className="marquee-track space-x-8 pl-8 text-black font-display font-bold tracking-widest text-xl md:text-2xl uppercase whitespace-nowrap opacity-80 cursor-default" data-cursor="hover">
          <span>GET HIRED FASTER</span>
          <span>✦</span>
          <span>BEAT THE ATS</span>
          <span>✦</span>
          <span>AUTOMATE OUTREACH</span>
          <span>✦</span>
          <span>GET HIRED FASTER</span>
          <span>✦</span>
          <span>BEAT THE ATS</span>
          <span>✦</span>
          <span>AUTOMATE OUTREACH</span>
          <span>✦</span>
          <span>GET HIRED FASTER</span>
          <span>✦</span>
          <span>BEAT THE ATS</span>
          <span>✦</span>
          <span>AUTOMATE OUTREACH</span>
          <span>✦</span>
        </div>
      </div>
    </section>
  );
}
