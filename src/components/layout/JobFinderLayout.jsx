import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ListPlus, Wallet, Settings, ShoppingCart, Info } from 'lucide-react';
import NotificationsBell from '../job-finder/NotificationsBell';
import CartDrawer from '../job-finder/CartDrawer';
import JobFinderIntroModal from '../job-finder/JobFinderIntroModal';
import { useCart } from '../../pages/job-finder/CartContext';
import { IntroVisibilityProvider, useIntroVisibility } from '../../pages/job-finder/IntroVisibilityContext';

const subNav = [
  { name: 'Marketplace', to: '/dashboard/job-finder', end: true, icon: Store },
  { name: 'Subscriptions', to: '/dashboard/job-finder/subscriptions', end: false, icon: ListPlus },
  { name: 'Wallet', to: '/dashboard/job-finder/wallet', end: false, icon: Wallet },
  { name: 'Settings', to: '/dashboard/job-finder/settings', end: false, icon: Settings },
];

export default function JobFinderLayout() {
  return (
    <IntroVisibilityProvider>
      <JobFinderLayoutInner />
    </IntroVisibilityProvider>
  );
}

function JobFinderLayoutInner() {
  const location = useLocation();
  const { cart, wallet } = useCart();
  const { inlineIntroOpen } = useIntroVisibility();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);

  const showIntroTrigger = !inlineIntroOpen;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pill-badge bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] mb-4">MARKETPLACE</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
            Job Finder.
          </h1>
          <p className="mt-4 text-black/50 font-medium max-w-lg">
            Subscribe to companies and get notified the moment a role fits you.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          {showIntroTrigger && (
            <>
              <button
                type="button"
                onClick={() => setIsIntroModalOpen(true)}
                aria-label="How Job Finder works"
                className="sm:hidden h-10 w-10 md:h-12 md:w-12 rounded-full border border-black/10 bg-white hover:bg-black/5 flex items-center justify-center transition-colors"
              >
                <Info className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsIntroModalOpen(true)}
                className="hidden sm:flex pill-badge bg-black/5 text-black hover:bg-black/10 transition-colors h-10 md:h-12 items-center cursor-pointer border border-transparent"
              >
                <Info className="h-4 w-4 mr-2" />
                <span className="font-bold text-xs uppercase tracking-widest mt-0.5">How It Works</span>
              </button>
            </>
          )}
          
          <NavLink to="/dashboard/job-finder/wallet" className="hidden sm:flex pill-badge bg-[var(--color-accent-yellow)]/20 text-black hover:bg-[var(--color-accent-yellow)]/40 transition-colors h-10 md:h-12 items-center">
            <Wallet className="h-4 w-4 mr-2" />
            <span className="font-display font-bold text-lg leading-none">{wallet.balance}</span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">Credits</span>
          </NavLink>
          
          <NotificationsBell />
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black text-white hover:bg-[var(--color-accent-blue)] flex items-center justify-center transition-colors relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center border-2 border-[var(--color-background)]">
                {cart.length}
              </span>
            )}
          </button>
        </motion.div>
      </div>

      {/* Sub navigation */}
      <div className="flex flex-wrap gap-3">
        {subNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${isActive ? 'pill-btn bg-black text-white' : 'pill-btn-secondary bg-white text-black'} flex items-center gap-2 !px-5 !py-2.5 text-sm`
              }
            >
              <Icon className="h-4 w-4" />
              {item.name.toUpperCase()}
            </NavLink>
          );
        })}
      </div>

      {/* Active sub-page */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <JobFinderIntroModal isOpen={isIntroModalOpen} onClose={() => setIsIntroModalOpen(false)} />
    </div>
  );
}
