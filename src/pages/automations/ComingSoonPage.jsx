import React, { useState, useEffect } from 'react';
import { MousePointer2, GitCommitHorizontal, PlaySquare, Check, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { waitlistApi } from '../../lib/api';
import { withMockFallback } from '../job-finder/helpers';
import { useToast } from '../../lib/toast';

export default function ComingSoonPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [wantsInsider, setWantsInsider] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('cn_automations_waitlist')) {
      setHasJoined(true);
    }
    
    // Fetch social proof
    const fetchCount = async () => {
      try {
        const res = await withMockFallback(
          waitlistApi.getCount('automations'), 
          { count: 128 }
        );
        if (res && res.count) {
          setWaitlistCount(res.count);
        }
      } catch (err) {
        console.error('Failed to fetch waitlist count', err);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address.');
      return;
    }
    setIsLoading(true);
    try {
      await waitlistApi.join({ email, tool: 'automations', wantsInsider });
      localStorage.setItem('cn_automations_waitlist', wantsInsider ? 'insider' : 'standard');
      setHasJoined(true);
      toast.success("You're on the list!");
    } catch (err) {
      toast.error(err.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isInsiderJoined = localStorage.getItem('cn_automations_waitlist') === 'insider' || wantsInsider;

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-10 px-6">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pill-badge bg-[var(--color-accent-yellow)]/20 text-black mb-6">COMING SOON</div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-[0.9]">
            Visual<br/>Automations.
          </h1>
          <p className="mt-6 text-black/60 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Drag tools onto a canvas, wire them together, and automate your entire job hunt end-to-end. 
            No coding required.
          </p>
        </motion.div>
      </div>

      {/* Decorative Mock Canvas Strip */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full min-h-[12rem] md:h-48 bg-black/5 rounded-[32px] overflow-hidden relative flex items-center justify-center pointer-events-none border border-black/10 py-8 md:py-0"
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-16 px-4">
          {/* Node 1 */}
          <div className="bento-card bg-white p-4 w-full max-w-[14rem] md:w-56 flex items-center gap-3 shadow-lg border-2 border-[var(--color-accent-blue)]">
            <div className="h-10 w-10 rounded-[12px] bg-[var(--color-accent-blue)] flex items-center justify-center text-white"><Check className="h-5 w-5" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-black/50">Job Finder</div>
              <div className="font-display font-bold text-sm uppercase leading-tight text-black">New Match</div>
            </div>
          </div>
          
          {/* Edge */}
          <div className="hidden md:block absolute left-[14rem] top-1/2 -translate-y-1/2 w-16 h-1 bg-black/20" />
          <div className="md:hidden w-1 h-8 bg-black/20 rounded-full" />
          
          {/* Node 2 */}
          <div className="bento-card bg-white p-4 w-full max-w-[14rem] md:w-56 flex items-center gap-3 shadow-lg border-2 border-[var(--color-accent-yellow)]">
            <div className="h-10 w-10 rounded-[12px] bg-[var(--color-accent-yellow)] flex items-center justify-center text-black"><PlaySquare className="h-5 w-5" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-black/50">Resume Maker</div>
              <div className="font-display font-bold text-sm uppercase leading-tight text-black">Tailor Resume</div>
            </div>
          </div>

          {/* Edge */}
          <div className="hidden md:block absolute left-[32rem] top-1/2 -translate-y-1/2 w-16 h-1 bg-black/20" />
          <div className="md:hidden w-1 h-8 bg-black/20 rounded-full" />

          {/* Node 3 */}
          <div className="bento-card bg-white p-4 w-full max-w-[14rem] md:w-56 flex items-center gap-3 shadow-lg border-2 border-black/5">
            <div className="h-10 w-10 rounded-[12px] bg-black flex items-center justify-center text-white"><Users className="h-5 w-5" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-black/50">Cold Mailer</div>
              <div className="font-display font-bold text-sm uppercase leading-tight text-black">Email Recruiter</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Explainer Grid (like JobFinderIntro) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bento-card bg-[var(--color-background)] border-2 border-black/10 overflow-hidden relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10 bg-white">
          <div className="p-8 group hover:bg-black/5 transition-colors">
            <div className="h-12 w-12 rounded-full bg-black/5 text-black flex items-center justify-center mb-6">
              <MousePointer2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase mb-3">Drag & Drop Nodes</h3>
            <p className="text-black/50 font-medium text-sm leading-relaxed">
              Every tool in CareerNode becomes a distinct node. Simply drag triggers and actions onto the canvas.
            </p>
          </div>

          <div className="p-8 group hover:bg-black/5 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] flex items-center justify-center mb-6">
              <GitCommitHorizontal className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase mb-3">Connect Your Tools</h3>
            <p className="text-black/50 font-medium text-sm leading-relaxed">
              Link Job Finder directly to Resume Maker and Cold Mailer to create end-to-end hunting flows.
            </p>
          </div>

          <div className="p-8 group hover:bg-black/5 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[var(--color-accent-yellow)]/20 text-black flex items-center justify-center mb-6">
              <PlaySquare className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase mb-3">Set & Forget</h3>
            <p className="text-black/50 font-medium text-sm leading-relaxed">
              Once wired up, triggers fire automatically 24/7 without you lifting a finger.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Signup Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-xl mx-auto"
      >
        <div className="bento-card p-8 bg-white border border-black/10 text-center shadow-[var(--shadow-soft)]">
          {hasJoined ? (
            <div className="flex flex-col items-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="font-display text-3xl font-bold uppercase mb-2">You're on the list.</h3>
              <p className="text-black/50 font-medium">
                We'll notify you as soon as Automations is ready to roll out {isInsiderJoined && 'for insider testing'}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <h3 className="font-display text-3xl font-bold uppercase mb-2">Get Early Access</h3>
                <p className="text-black/50 font-medium text-sm">Join the waitlist to be notified when we launch.</p>
              </div>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[var(--color-background)] border-2 border-black/10 rounded-full px-6 py-4 font-medium focus:outline-none focus:border-black transition-colors"
                disabled={isLoading}
              />

              <label
                className="flex items-center justify-center gap-3 cursor-pointer group w-full max-w-md mx-auto p-3 rounded-[20px] hover:bg-black/[0.02] transition-colors"
                onClick={() => setWantsInsider((v) => !v)}
              >
                <div className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${wantsInsider ? 'bg-[var(--color-accent-blue)]' : 'bg-black/10'}`}>
                  <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${wantsInsider ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  I want insider access - let me try it first
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] transition-colors w-full h-14 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? 'JOINING...' : 'NOTIFY ME'}
              </button>
            </form>
          )}

          {/* Social Proof */}
          {!hasJoined && waitlistCount && (
            <div className="mt-6 pt-6 border-t border-black/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center justify-center gap-2">
                <Users className="h-3 w-3" />
                Join {waitlistCount.toLocaleString()} others waiting for automations
              </p>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
