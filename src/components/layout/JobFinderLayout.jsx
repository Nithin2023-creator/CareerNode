import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ListPlus, Wallet, Settings, ShoppingCart, Info, AlertCircle } from 'lucide-react';
import NotificationsBell from '../job-finder/NotificationsBell';
import CartDrawer from '../job-finder/CartDrawer';
import JobFinderIntroModal from '../job-finder/JobFinderIntroModal';
import { useCart } from '../../pages/job-finder/CartContext';
import { IntroVisibilityProvider, useIntroVisibility } from '../../pages/job-finder/IntroVisibilityContext';
import { hasSeenJobFinderIntro } from '../../pages/job-finder/helpers';

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
  const { inlineIntroOpen, dismissIntro } = useIntroVisibility();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);

  const showIntroTrigger = !inlineIntroOpen;
  const isLowBalance = wallet.balance > 0 && wallet.balance < 20;

  useEffect(() => {
    if (!hasSeenJobFinderIntro() && window.matchMedia('(max-width: 767px)').matches) {
      setIsIntroModalOpen(true);
    }
  }, []);

  const handleCloseIntroModal = () => {
    dismissIntro();
    setIsIntroModalOpen(false);
  };

  return (
    <div className="space-y-4 md:space-y-10">
      {isLowBalance && (
        <div className="bento-card bg-[var(--color-accent-yellow)]/10 border-2 border-[var(--color-accent-yellow)]/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-black/60 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-black/70">
              Your wallet is running low ({wallet.balance} credits). Top up to keep subscribing to companies.
            </p>
          </div>
          <Link to="/dashboard/job-finder/wallet" className="pill-btn-secondary !py-2 !px-4 text-xs shrink-0 bg-white">
            TOP UP
          </Link>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-6 w-full overflow-x-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pill-badge bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] mb-4">MARKETPLACE</div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
            Job Finder.
          </h1>
          <p className="mt-2 md:mt-4 text-sm md:text-base text-black/50 font-medium max-w-lg">
            Subscribe to companies and get notified the moment a role fits you.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto max-w-full">
          {showIntroTrigger && (
            <>
              <button
                type="button"
                onClick={() => setIsIntroModalOpen(true)}
                aria-label="How Job Finder works"
                className="sm:hidden h-10 w-10 md:h-12 md:w-12 rounded-full border border-black/10 bg-white hover:bg-black/5 flex items-center justify-center transition-colors shrink-0"
              >
                <Info className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsIntroModalOpen(true)}
                className="hidden sm:flex pill-badge bg-black/5 text-black hover:bg-black/10 transition-colors h-10 md:h-12 items-center cursor-pointer border border-transparent shrink-0"
              >
                <Info className="h-4 w-4 mr-2" />
                <span className="font-bold text-xs uppercase tracking-widest mt-0.5">How It Works</span>
              </button>
            </>
          )}
          
          <NavLink to="/dashboard/job-finder/wallet" className="flex sm:hidden h-10 w-10 rounded-full bg-[var(--color-accent-yellow)]/20 text-black hover:bg-[var(--color-accent-yellow)]/40 transition-colors items-center justify-center shrink-0" aria-label={`Wallet balance: ${wallet.balance} credits`}>
            <Wallet className="h-4 w-4" />
          </NavLink>

          <NavLink to="/dashboard/job-finder/wallet" className="hidden sm:flex pill-badge bg-[var(--color-accent-yellow)]/20 text-black hover:bg-[var(--color-accent-yellow)]/40 transition-colors h-10 md:h-12 items-center shrink-0">
            <Wallet className="h-4 w-4 mr-2" />
            <span className="font-display font-bold text-lg leading-none">{wallet.balance}</span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">Credits</span>
          </NavLink>
          
          <NotificationsBell />
          
          <div className="relative overflow-visible shrink-0">
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
          </div>
        </motion.div>
      </div>

      {/* Sub navigation */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-1 px-1">
        {subNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${isActive ? 'pill-btn bg-black text-white' : 'pill-btn-secondary bg-white text-black'} flex items-center gap-2 !px-5 !py-2.5 text-sm shrink-0`
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
      <JobFinderIntroModal isOpen={isIntroModalOpen} onClose={handleCloseIntroModal} />
    </div>
  );
}
