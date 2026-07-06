import React, { useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  Coins, 
  Users, 
  ListTodo, 
  CreditCard,
  Settings,
  LogOut,
  Crown
} from 'lucide-react';
import { initLenisScroll } from '../../lib/lenisScroll';
import { clearWalletCache } from '../../context/WalletContext';

const adminNavItems = [
  { name: 'Overview', to: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Companies', to: '/admin/companies', icon: Building2 },
  { name: 'HR Bundles', to: '/admin/bundles', icon: Package },
  { name: 'Credit Packs', to: '/admin/credit-packs', icon: Coins },
  { name: 'Membership Plans', to: '/admin/membership-plans', icon: Crown },
  { name: 'Users', to: '/admin/users', icon: Users },
  { name: 'Waitlist', to: '/admin/waitlist', icon: ListTodo },
  { name: 'Transactions', to: '/admin/transactions', icon: CreditCard },
  { name: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  
  useEffect(() => {
    return initLenisScroll();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cn_token');
    localStorage.removeItem('cn_user');
    clearWalletCache();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-black flex">
      {/* Light Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-white border-r-2 border-black z-10">
        <div className="p-6">
          <Link to="/dashboard" className="flex flex-col items-start gap-1 mb-8 hover:-translate-y-1 transition-transform">
            <span className="font-display font-bold text-2xl tracking-tight text-black leading-none uppercase">
              CareerNode
            </span>
            <span className="font-display font-bold text-sm tracking-widest text-[var(--color-accent-blue)] uppercase">
              Admin
            </span>
          </Link>
          
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                      isActive
                        ? 'bg-black text-white shadow-[var(--shadow-soft)]'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t-2 border-black">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-xs font-bold tracking-widest uppercase text-red-600/70 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-[var(--color-bg)] overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
