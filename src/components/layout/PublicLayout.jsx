import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    return initLenisScroll();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-black relative">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <SplashScreen />
      <CustomCursor />
      {location.pathname === '/' && <SectionDotNav />}
      
      {/* Minimal Top Nav */}
      <nav className="fixed top-0 w-full z-50 p-4 md:p-6 lg:px-8 lg:py-6 pointer-events-none">
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
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs sm:text-sm font-bold tracking-widest uppercase hover:text-[var(--color-accent-blue)] transition-colors"
            >
              Log in
            </button>
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
