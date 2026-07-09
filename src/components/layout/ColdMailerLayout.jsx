import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, PenLine, Layers, Settings, Store, Package, ShoppingCart, Coins, Send, AlertTriangle, X } from 'lucide-react';
import { BundleCartProvider, useBundleCart } from '../../pages/cold-mailer/BundleCartContext';
import { useWallet } from '../../context/WalletContext';
import BundleCartDrawer from '../cold-mailer/BundleCartDrawer';
import { gmailConnectionApi } from '../../lib/api';

const subNav = [
  { name: 'Quick Draft', to: '/dashboard/emailer', end: true, icon: PenLine },
  { name: 'Campaigns', to: '/dashboard/emailer/campaigns', end: false, icon: Layers },
  { name: 'Settings', to: '/dashboard/emailer/settings', end: true, icon: Settings },
  { name: 'HR Marketplace', to: '/dashboard/emailer/marketplace', end: false, icon: Store },
  { name: 'My Bundles', to: '/dashboard/emailer/bundles', end: false, icon: Package },
];

function ColdMailerHeader() {
  const location = useLocation();
  const onCampaigns = location.pathname === '/dashboard/emailer/campaigns';
  const { cart } = useBundleCart();
  const { wallet } = useWallet();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  React.useEffect(() => {
    gmailConnectionApi.getStatus().then(res => setGmailStatus(res)).catch(console.error);
  }, [location.pathname]); // Refresh on navigation

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full overflow-x-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pill-badge bg-[var(--color-accent-yellow)]/20 text-black mb-4">OUTREACH</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
            Cold Mailer.
          </h1>
          <p className="mt-2 md:mt-4 text-sm md:text-base text-black/50 font-medium max-w-lg">
            Draft one-off emails or run personalized bulk campaigns from your CSV lists.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 md:mt-0 w-full md:w-auto max-w-full">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
            <Link 
              to="/dashboard/job-finder/wallet"
              className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors"
              title="Shared Wallet Balance"
            >
              <Coins className="w-5 h-5 text-[var(--color-accent-yellow)]" />
              <span className="font-bold">{wallet?.balance || 0}</span>
            </Link>
          </motion.div>

          {gmailStatus?.connected && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}>
              <button 
                onClick={() => setInfoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-yellow)]/10 text-yellow-800 border border-[var(--color-accent-yellow)]/30 rounded-full hover:bg-[var(--color-accent-yellow)]/20 transition-colors"
                title="Daily Send Allowance"
              >
                <Send className="w-4 h-4" />
                <span className="font-bold text-sm">Today's sends: {gmailStatus.sentToday || 0}/{gmailStatus.dailyLimit || 500}</span>
              </button>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}>
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
              className="relative min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors shrink-0"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--color-background)]">
                  {cart.length}
                </span>
              )}
            </button>
          </motion.div>

          {onCampaigns && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
              <NavLink to="/dashboard/emailer/campaigns/new" className="pill-btn flex items-center gap-2 bg-[var(--color-accent-yellow)] text-black border-transparent">
                <Plus className="h-5 w-5" /> NEW CAMPAIGN
              </NavLink>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-1 px-1">
        {subNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${isActive ? 'pill-btn' : 'pill-btn-secondary'} flex items-center gap-2 !px-5 !py-2.5 text-sm shrink-0`
              }
            >
              <Icon className="h-4 w-4" />
              {item.name.toUpperCase()}
            </NavLink>
          );
        })}
      </div>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>

      <BundleCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Info Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInfoModalOpen(false)} />
          <div className="bento-card bg-white w-full max-w-lg relative z-10 p-6 sm:p-8 flex flex-col shadow-2xl">
            <button
              onClick={() => setInfoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight">Daily Cap</h3>
            </div>
            <p className="text-black/60 font-medium leading-relaxed mb-6">
              Sending more than ~500 cold emails a day from one Gmail account sharply increases the chance of landing in spam folders and can get your account flagged — which hurts the responses you get from HRs. We cap daily sends to protect your deliverability.
            </p>
            <button onClick={() => setInfoModalOpen(false)} className="pill-btn w-full">GOT IT</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ColdMailerLayout() {
  return (
    <BundleCartProvider>
      <ColdMailerHeader />
    </BundleCartProvider>
  );
}


