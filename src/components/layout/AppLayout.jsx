import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNavDrawer from './MobileNavDrawer';
import WelcomeCreditsModal from '../onboarding/WelcomeCreditsModal';
import { AnimatePresence, motion } from 'framer-motion';
import { initLenisScroll, scrollToTop } from '../../lib/lenisScroll';

export default function AppLayout() {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    return initLenisScroll();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-black p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex justify-between items-center mb-4 pt-[env(safe-area-inset-top)] px-2">
        <div className="flex flex-col items-start gap-1">
          <span className="font-display font-bold text-2xl tracking-tight text-black leading-none uppercase">Career</span>
          <span className="font-display font-bold text-2xl tracking-tight text-white bg-black px-1.5 rounded-xl leading-none uppercase mt-1">Node.</span>
        </div>
        <button 
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Open navigation menu"
          className="h-11 w-11 flex items-center justify-center bg-white rounded-full shadow-[var(--shadow-soft)] hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <MobileNavDrawer isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      
      <WelcomeCreditsModal />

      {/* Sidebar is fixed on the left inside a sticky container */}
      <div className="sticky top-8 h-[calc(100vh-4rem)] z-20 hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area - The Inner Frame */}
      <main className="flex-1 min-w-0 overflow-x-hidden bg-white rounded-[32px] lg:rounded-[48px] ml-0 lg:ml-6 relative shadow-[var(--shadow-soft)] min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] overflow-y-visible">
        <div className="mx-auto w-full h-full min-w-0">
          <AnimatePresence mode="wait" onExitComplete={scrollToTop}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 sm:p-6 md:p-10 lg:p-12 min-w-0 max-w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
