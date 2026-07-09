import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { initLenisScroll } from '../../lib/lenisScroll';
import PublicFooter from './PublicFooter';
import CustomCursor from '../interactive/CustomCursor';
import SectionDotNav from '../interactive/SectionDotNav';
import SplashScreen from '../interactive/SplashScreen';
import HouseIcon from '../interactive/HouseIcon';
import LoginModal from '../auth/LoginModal';

export default function PublicLayout() {
  const location = useLocation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('cn_token');
  const glowRef = useRef(null);
  
  const isLanding = location.pathname === '/';

  useEffect(() => {
    return initLenisScroll();
  }, []);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isLanding || isTouch || prefersReducedMotion || !glowRef.current) return;

    gsap.set(glowRef.current, { x: -300, y: -300, opacity: 0 });
    gsap.to(glowRef.current, { opacity: 1, duration: 1.2, delay: 0.5, ease: 'power2.out' });

    const xTo = gsap.quickTo(glowRef.current, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(glowRef.current, 'y', { duration: 0.6, ease: 'power3' });

    const handleMouseMove = (e) => {
      // Offset by half glow size (600/2)
      xTo(e.clientX - 300);
      yTo(e.clientY - 300);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLanding]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-black relative">
      {isLanding && (
        <div
          ref={glowRef}
          className="fixed top-0 left-0 w-[600px] h-[600px] bg-[var(--color-accent-blue)]/15 rounded-full blur-[100px] pointer-events-none hidden lg:block z-40 mix-blend-multiply opacity-0"
        />
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <SplashScreen />
      <CustomCursor />
      {location.pathname === '/' && <SectionDotNav />}
      
      {/* Minimal Top Nav */}
      <nav className="fixed top-0 w-full z-50 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-6 md:pb-6 md:pt-[max(1.5rem,env(safe-area-inset-top))] lg:px-8 lg:pb-6 lg:pt-[max(1.5rem,env(safe-area-inset-top))] pointer-events-none">
        <div className="mx-auto flex justify-between items-center pointer-events-auto">
          {/* Logo */}
          <Link to="/" className="bg-white/80 backdrop-blur-md rounded-full px-4 py-2 sm:px-6 sm:py-3 hover:translate-y-[-2px] transition-all flex items-center gap-1 group shadow-[var(--shadow-soft)] min-w-0">
            <span className="font-display font-bold text-lg sm:text-2xl tracking-tight text-black leading-none uppercase truncate">
              Career
            </span>
            <span className="font-display font-bold text-lg sm:text-2xl tracking-tight text-white bg-black px-1.5 rounded-xl leading-none uppercase pt-0.5">
              Node.
            </span>
            <HouseIcon
              data-splash-nav-target
              className="w-4 h-4 md:w-5 md:h-5 shrink-0 ml-1"
              style={{ opacity: sessionStorage.getItem('cn_splash_seen') ? 1 : 0 }}
            />
          </Link>

          {/* CTA */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link 
              to="/pricing"
              className="text-xs sm:text-sm font-bold tracking-widest uppercase hover:text-[var(--color-accent-blue)] transition-colors hidden sm:block"
            >
              Pricing
            </Link>
            {!isAuthenticated && (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-xs sm:text-sm font-bold tracking-widest uppercase hover:text-[var(--color-accent-blue)] transition-colors"
              >
                Log in
              </button>
            )}
            <Link to="/dashboard" className="bg-black text-white rounded-full px-4 py-2 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm tracking-widest hover:bg-[var(--color-accent-blue)] hover:text-white hover:-translate-y-0.5 transition-all flex items-center gap-1 sm:gap-2 group shadow-[var(--shadow-soft)]">
              DASHBOARD <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full pt-20 sm:pt-24">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
