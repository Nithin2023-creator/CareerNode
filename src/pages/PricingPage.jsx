import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipApi } from '../lib/api';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await membershipApi.getPlans();
        setPlans(res);
      } catch (err) {
        console.error('Failed to load plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCta = () => {
    const isAuthenticated = !!localStorage.getItem('cn_token');
    if (isAuthenticated) {
      navigate('/dashboard/billing');
    } else {
      navigate('/login?redirect=/dashboard/billing');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-display text-xl font-bold uppercase text-black/40">
        Loading Pricing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight text-black">
            Simple, Transparent Pricing.
          </h1>
          <p className="text-xl font-medium text-black/50">
            Level up your job search. No hidden fees. Cancel anytime.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="relative bento-card bg-white border-2 border-black rounded-3xl p-8 flex flex-col shadow-[var(--shadow-lift)] hover:-translate-y-2 hover:shadow-[var(--shadow-solid)] transition-all duration-300"
            >
              {plan.tier === 'pro' && (
                <div className="absolute -top-4 -right-4 bg-[var(--color-accent-blue)] text-white text-sm font-bold uppercase tracking-widest px-4 py-1.5 border-2 border-black rounded-full shadow-[var(--shadow-soft)] rotate-3">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-black">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold text-black">₹{plan.monthlyPrice}</span>
                  <span className="text-black/50 font-bold text-lg">/mo</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-3 font-medium text-black/80">
                    <Check className="w-6 h-6 text-[var(--color-accent-blue)] shrink-0" strokeWidth={3} />
                    <span className="leading-snug">{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCta}
                className={`w-full py-4 px-6 text-lg font-bold uppercase tracking-widest rounded-full border-2 border-black shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition-all ${
                  plan.tier === 'pro'
                    ? 'bg-[var(--color-accent-blue)] text-white'
                    : 'bg-[var(--color-accent-yellow)] text-black'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
