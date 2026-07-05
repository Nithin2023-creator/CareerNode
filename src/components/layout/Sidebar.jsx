import { NavLink } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { navItems } from '../../config/navItems';

export default function Sidebar() {
  return (
    <aside className="w-[260px] flex-shrink-0 flex flex-col h-full hidden lg:flex space-y-4">
      {/* Logo Title */}
      <div className="px-2 pt-2 pb-4">
        <div className="flex flex-col items-start gap-1">
          <span className="font-display font-bold text-4xl tracking-tight text-black leading-none uppercase">
            Career
          </span>
          <span className="font-display font-bold text-4xl tracking-tight text-white bg-black px-2 rounded-xl leading-none uppercase pt-1">
            Node.
          </span>
        </div>
      </div>

      {/* Nav Cards */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `group flex flex-col justify-between p-5 transition-all duration-300 rounded-[32px] overflow-hidden relative ${
                isActive
                  ? 'bg-black text-white shadow-[var(--shadow-soft)]'
                  : 'bg-transparent text-black hover:bg-white/80 hover:shadow-[var(--shadow-soft)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex justify-between items-start mb-6 z-10 relative">
                  <div className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-black'}`}>
                    {item.tag}
                  </div>
                  <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-transparent text-black group-hover:bg-black group-hover:text-white'}`}>
                    {isActive ? <ArrowRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                </div>
                
                <div className="z-10 relative">
                  <h3 className="font-display font-bold text-2xl uppercase tracking-wide leading-none">{item.name}</h3>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-[16px] bg-[var(--color-accent-blue)] flex items-center justify-center text-white font-display font-bold text-xl shadow-[var(--shadow-soft)]">
            NF
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black uppercase tracking-tight text-sm">New Fresher</span>
            <span className="text-[10px] text-black font-bold uppercase tracking-widest bg-[var(--color-accent-yellow)] px-2 py-0.5 rounded-full w-fit mt-1 shadow-sm">PRO PLAN</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
