import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { initLenisScroll } from '../../lib/lenisScroll';

export default function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    return initLenisScroll();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-black p-4 md:p-6 lg:p-8 flex">
      {/* Sidebar is fixed on the left inside a sticky container */}
      <div className="sticky top-8 h-[calc(100vh-4rem)] z-20">
        <Sidebar />
      </div>
      
      {/* Main Content Area - The Inner Frame */}
      <main className="flex-1 bg-white rounded-[48px] ml-6 relative shadow-[var(--shadow-soft)] min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="mx-auto w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-6 md:p-10 lg:p-12"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
