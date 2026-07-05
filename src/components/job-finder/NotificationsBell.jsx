import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobFinderApi } from '../../lib/api';
import { withMockFallback, formatDate } from '../../pages/job-finder/helpers';
import { mockNotifications } from '../../pages/job-finder/mockData';

export default function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await withMockFallback(jobFinderApi.listNotifications(), mockNotifications);
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      // In a real app we'd call an endpoint for mark-all-read or loop through unread
      await withMockFallback(jobFinderApi.markNotificationRead('all'), { success: true });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-black/10 bg-white hover:bg-black/5 flex items-center justify-center transition-colors relative"
      >
        <Bell className="h-5 w-5 text-black/70" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 md:h-5 md:w-5 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white border border-black/10 rounded-[24px] shadow-[var(--shadow-lift)] overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-black/10 flex justify-between items-center bg-black/5">
            <h3 className="font-display font-bold uppercase tracking-wide">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-bold text-black/40 hover:text-black flex items-center gap-1">
                <Check className="h-3 w-3" /> MARK ALL READ
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-black/40 font-bold uppercase text-xs">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-black/40 font-bold uppercase text-xs">No notifications</div>
            ) : (
              <div className="flex flex-col divide-y divide-black/5">
                {notifications.map(n => (
                  <Link 
                    key={n.id} 
                    to={`/dashboard/job-finder/subscriptions/${n.subscriptionId}`}
                    onClick={() => setIsOpen(false)}
                    className={`p-4 hover:bg-black/5 transition-colors flex gap-4 ${!n.read ? 'bg-[var(--color-accent-blue)]/5' : ''}`}
                  >
                    {!n.read && <div className="mt-2 h-2 w-2 rounded-full bg-[var(--color-accent-blue)] flex-shrink-0" />}
                    <div className={!n.read ? '' : 'pl-6'}>
                      <p className="text-xs font-bold uppercase text-black/50 mb-1">{n.companyName} • {formatDate(n.createdAt)}</p>
                      <p className="font-medium text-black leading-snug">{n.jobTitle}</p>
                      <p className="text-[10px] font-bold uppercase text-[var(--color-accent-blue)] mt-2 flex items-center gap-1">
                        View Match <ArrowRight className="h-3 w-3" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
