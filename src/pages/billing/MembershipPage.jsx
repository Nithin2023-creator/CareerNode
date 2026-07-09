import React, { useEffect, useState } from 'react';
import { membershipApi } from '../../lib/api';
import { Check } from 'lucide-react';
import { openSubscriptionAuthorization, pollMembershipActive } from '../../lib/cashfree';

export default function MembershipPage() {
  const [plans, setPlans] = useState([]);
  const [myPlan, setMyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMembership = async () => {
    const [plansRes, meRes] = await Promise.all([
      membershipApi.getPlans(),
      membershipApi.getMe(),
    ]);
    setPlans(plansRes);
    setMyPlan(meRes);
  };

  useEffect(() => {
    fetchMembership()
      .catch((err) => console.error('Failed to load membership data', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId) => {
    setActionLoading(true);
    try {
      const res = await membershipApi.subscribe(planId);

      if (res.paymentSessionId || res.authorizationLink) {
        await openSubscriptionAuthorization({
          paymentSessionId: res.paymentSessionId,
          authorizationLink: res.authorizationLink,
        });

        const updated = await pollMembershipActive(() => membershipApi.getMe());
        if (updated) {
          setMyPlan(updated);
        } else {
          alert('Authorization is still processing. Refresh the page in a moment.');
        }
      } else if (res.success && res.membership) {
        setMyPlan(res.membership);
      }
    } catch (err) {
      alert(err.message || 'Failed to subscribe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your paid membership? You will keep your benefits until the end of the billing period.'
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await membershipApi.cancel();
      if (res.success) {
        setMyPlan(res.membership);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-bold uppercase tracking-widest text-black/40">
        Loading plans...
      </div>
    );
  }

  const currentPlanTier = myPlan?.planId?.tier || 'free';
  const isPendingAuth = myPlan?.status === 'pending_authorization';

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-black">
          Your Membership
        </h1>
        <p className="text-black/50 font-medium mt-2">Manage your plan, perks, and monthly credits.</p>
      </header>

      {isPendingAuth && (
        <div className="bento-card bg-[var(--color-accent-blue)]/10 border-2 border-[var(--color-accent-blue)]/30 p-4 rounded-2xl">
          <p className="text-[var(--color-accent-blue)] font-semibold">
            Your membership upgrade is awaiting payment authorization. Complete the Cashfree mandate if you have not already.
          </p>
        </div>
      )}

      {myPlan?.cancelAtPeriodEnd && (
        <div className="bento-card bg-red-50 border-2 border-red-200 p-4 rounded-2xl">
          <p className="text-red-700 font-semibold">
            Your membership is set to cancel at the end of the current period (
            {new Date(myPlan.renewsAt).toLocaleDateString()}).
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 max-w-sm">
        {plans
          .filter((plan) => plan.tier === currentPlanTier)
          .map((plan) => {
          const isCurrent = currentPlanTier === plan.tier;
          const isPendingThisPlan =
            isPendingAuth && String(myPlan?.pendingPlanId) === String(plan._id);

          return (
            <div
              key={plan._id}
              className={`relative bento-card !overflow-visible bg-white border-2 rounded-3xl p-6 mt-4 flex flex-col shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-all ${
                isCurrent ? 'border-black shadow-[var(--shadow-lift)]' : 'border-black/10'
              }`}
            >
              {plan.tier === 'pro' && !isCurrent && !isPendingThisPlan && (
                <div className="absolute -top-3 -right-3 bg-[var(--color-accent-blue)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-2 border-black rounded-full shadow-[var(--shadow-soft)] rotate-3">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 -left-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-2 border-black rounded-full shadow-[var(--shadow-soft)] -rotate-3">
                  Current Plan
                </div>
              )}
              {isPendingThisPlan && (
                <div className="absolute -top-3 -left-3 bg-[var(--color-accent-yellow)] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-2 border-black rounded-full shadow-[var(--shadow-soft)] -rotate-3">
                  Authorizing
                </div>
              )}

              <div className="mb-6 mt-2">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-black">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-black">₹{plan.monthlyPrice}</span>
                  <span className="text-black/50 font-medium">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium text-black/80">
                    <Check className="w-5 h-5 text-[var(--color-accent-blue)] shrink-0" strokeWidth={3} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isCurrent ? (
                  plan.tier === 'free' ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 bg-black/5 text-black/40 font-bold uppercase tracking-widest rounded-full text-sm"
                    >
                      Current Plan
                    </button>
                  ) : (
                    !myPlan.cancelAtPeriodEnd && (
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-white text-red-600 font-bold uppercase tracking-widest rounded-full border-2 border-red-200 hover:border-red-600 hover:bg-red-50 transition-colors text-sm"
                      >
                        Cancel Auto-Renew
                      </button>
                    )
                  )
                ) : isPendingThisPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-black/5 text-black/50 font-bold uppercase tracking-widest rounded-full text-sm"
                  >
                    Awaiting Authorization
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={actionLoading || isPendingAuth}
                    className={`w-full py-3 px-4 font-bold uppercase tracking-widest rounded-full border-2 border-black shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 ${
                      plan.tier === 'pro'
                        ? 'bg-[var(--color-accent-blue)] text-white'
                        : 'bg-[var(--color-accent-yellow)] text-black'
                    }`}
                  >
                    {actionLoading ? 'Processing...' : `Upgrade to ${plan.badge}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
