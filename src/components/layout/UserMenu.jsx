import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User, ChevronsUpDown, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi, membershipApi } from '../../lib/api';
import { clearWalletCache, useWallet } from '../../context/WalletContext';

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [myPlan, setMyPlan] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const walletCtx = useWallet();

  useEffect(() => {
    const token = localStorage.getItem('cn_token');

    try {
      const stored = localStorage.getItem('cn_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      console.error('Failed to parse user data');
    }

    if (!token) return;

    authApi
      .me()
      .then((data) => {
        localStorage.setItem('cn_user', JSON.stringify(data.user));
        setUser(data.user);
        return membershipApi.getMe();
      })
      .then(setMyPlan)
      .catch(() => {
        // Keep cached user from localStorage if /me fails transiently
      });

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cn_user');
    localStorage.removeItem('cn_token');
    clearWalletCache();
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white/80 backdrop-blur-md rounded-[32px] p-4 lg:p-5 shadow-[var(--shadow-soft)] hover:bg-white transition-all duration-200 flex items-center gap-3 text-left border border-transparent"
        >
          <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-[16px] bg-black/5 flex shrink-0 items-center justify-center text-black/40 font-display font-bold shadow-[var(--shadow-soft)]">
            <User className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-black uppercase tracking-tight text-xs lg:text-sm truncate">Guest Session</span>
            <span className="text-[9px] lg:text-[10px] text-black font-bold uppercase tracking-widest bg-black/5 px-2 py-0.5 rounded-full w-fit mt-1 shadow-sm">CLICK TO LOGIN</span>
          </div>
        </button>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const avatar = (size) =>
    user.picture ? (
      <img src={user.picture} alt={user.name} className={`${size} rounded-[16px] object-cover shadow-[var(--shadow-soft)] shrink-0`} />
    ) : (
      <div className={`${size} rounded-[16px] bg-[var(--color-accent-blue)] flex shrink-0 items-center justify-center text-white font-display font-bold shadow-[var(--shadow-soft)]`}>
        {initials}
      </div>
    );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full bg-white/80 backdrop-blur-md rounded-[32px] p-4 lg:p-5 shadow-[var(--shadow-soft)] hover:bg-white transition-all duration-200 flex items-center gap-3 text-left border ${isOpen ? 'border-black/10 bg-white' : 'border-transparent'}`}
      >
        {avatar('h-10 w-10 lg:h-12 lg:w-12 text-lg lg:text-xl')}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-bold text-black uppercase tracking-tight text-xs lg:text-sm truncate">{user.name}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/dashboard/billing');
            }}
            className={`
              text-[9px] lg:text-[10px] text-black font-bold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mt-1 shadow-sm hover:scale-105 transition-transform
              ${myPlan?.planId?.tier === 'pro' ? 'bg-[var(--color-accent-blue)] text-white' : 
                myPlan?.planId?.tier === 'elite' ? 'bg-black text-white' : 'bg-[var(--color-accent-yellow)]'}
            `}
          >
            {myPlan?.planId?.badge || 'FREE'} PLAN
          </button>
        </div>
        <ChevronsUpDown className={`w-4 h-4 shrink-0 text-black/30 transition-transform duration-200 ${isOpen ? 'text-black/60' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-3 left-0 w-full bg-white rounded-[24px] shadow-xl border border-black/5 overflow-hidden z-50 origin-bottom"
          >
            {/* Profile header */}
            <div className="flex items-center gap-3 p-4 bg-black/[0.03]">
              {avatar('h-11 w-11 text-base')}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-black text-sm truncate">{user.name}</p>
                <p className="text-xs text-black/45 font-medium truncate normal-case tracking-normal">{user.email}</p>
              </div>
            </div>

            <div className="p-2">
              {/* Wallet Balance */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/job-finder/wallet');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold tracking-wide rounded-[16px] hover:bg-black/5 transition-colors text-black"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-[10px] bg-[var(--color-accent-yellow)]/15 text-[var(--color-accent-yellow)] shrink-0">
                  <Wallet className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left">Wallet</span>
                <span className="font-display font-bold text-sm text-black">
                  {walletCtx?.wallet?.balance ?? 0}<span className="text-black/40 text-xs ml-0.5">c</span>
                </span>
              </button>

              <div className="h-px bg-black/5 mx-3 my-1" />
              {user?.isAdmin && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold tracking-wide rounded-[16px] hover:bg-black/5 transition-colors text-black"
                >
                  <span className="flex items-center justify-center h-8 w-8 rounded-[10px] bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  </span>
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/job-finder/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold tracking-wide rounded-[16px] hover:bg-black/5 transition-colors text-black"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-[10px] bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shrink-0">
                  <User className="w-4 h-4" />
                </span>
                Profile & Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold tracking-wide rounded-[16px] hover:bg-red-50 text-red-600 transition-colors mt-1"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-[10px] bg-red-500/10 text-red-600 shrink-0">
                  <LogOut className="w-4 h-4" />
                </span>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
