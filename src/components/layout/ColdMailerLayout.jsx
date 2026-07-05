import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, PenLine, Layers, Settings, Store, Package, ShoppingCart, Coins } from 'lucide-react';
import { BundleCartProvider, useBundleCart } from '../../pages/cold-mailer/BundleCartContext';
import { useWallet } from '../../context/WalletContext';
import BundleCartDrawer from '../cold-mailer/BundleCartDrawer';

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

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pill-badge bg-[var(--color-accent-yellow)]/20 text-black mb-4">OUTREACH</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
            Cold Mailer.
          </h1>
          <p className="mt-4 text-black/50 font-medium max-w-lg">
            Draft one-off emails or run personalized bulk campaigns from your CSV lists.
          </p>
        </motion.div>

        <div className="flex items-center gap-4">
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

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
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

      <div className="flex flex-wrap gap-3">
        {subNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${isActive ? 'pill-btn' : 'pill-btn-secondary'} flex items-center gap-2 !px-5 !py-2.5 text-sm`
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


