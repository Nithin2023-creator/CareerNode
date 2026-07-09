import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight, X } from 'lucide-react';
import { navItems } from '../../config/navItems';
import UserMenu from './UserMenu';

export default function MobileNavDrawer({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--color-background)] z-[70] flex flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl lg:hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col items-start gap-1">
                <span className="font-display font-bold text-2xl tracking-tight text-black leading-none uppercase">
                  Career
                </span>
                <span className="font-display font-bold text-2xl tracking-tight text-white bg-black px-2 rounded-xl leading-none uppercase pt-1">
                  Node.
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-3 overflow-y-auto pb-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex flex-col justify-between p-5 transition-all duration-300 rounded-[24px] overflow-hidden relative ${
                      isActive
                        ? 'bg-black text-white shadow-[var(--shadow-soft)]'
                        : 'bg-white text-black shadow-sm'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex justify-between items-start mb-6 z-10 relative">
                        <div className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-black'}`}>
                          {item.tag}
                        </div>
                        <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-transparent text-black'}`}>
                          {isActive ? <ArrowRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                      </div>
                      
                      <div className="z-10 relative">
                        <h3 className="font-display font-bold text-xl uppercase tracking-wide leading-none">{item.name}</h3>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            
            <div className="mt-auto pt-4">
              <UserMenu />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
