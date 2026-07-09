import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '../../lib/toast';

const emptyForm = {
  name: '',
  tier: 'pro',
  monthlyPrice: 19,
  monthlyBonusCredits: 50,
  alaCarteDiscountPercent: 15,
  maxActiveSubscriptions: 10,
  perks: '',
  badge: '',
  isActive: true,
};

export default function AdminMembershipPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const toast = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await adminApi.listMembershipPlans();
      setPlans(res);
    } catch {
      toast.error('Failed to fetch membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this membership plan?')) return;
    try {
      await adminApi.deleteMembershipPlan(id);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        tier: plan.tier,
        monthlyPrice: plan.monthlyPrice,
        monthlyBonusCredits: plan.monthlyBonusCredits,
        alaCarteDiscountPercent: plan.alaCarteDiscountPercent,
        maxActiveSubscriptions: plan.maxActiveSubscriptions ?? '',
        perks: (plan.perks || []).join('\n'),
        badge: plan.badge || '',
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      monthlyPrice: Number(formData.monthlyPrice),
      monthlyBonusCredits: Number(formData.monthlyBonusCredits),
      alaCarteDiscountPercent: Number(formData.alaCarteDiscountPercent),
      maxActiveSubscriptions:
        formData.maxActiveSubscriptions === '' || formData.maxActiveSubscriptions == null
          ? null
          : Number(formData.maxActiveSubscriptions),
      perks: formData.perks
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean),
    };

    try {
      if (editingPlan) {
        await adminApi.updateMembershipPlan(editingPlan._id, payload);
        toast.success('Plan updated');
      } else {
        await adminApi.createMembershipPlan(payload);
        toast.success('Plan created');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">
            Membership Plans
          </h1>
          <p className="text-black/50 text-sm font-medium">
            Configure Free, Pro, and Elite tiers with perks and limits.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--color-accent-yellow)] text-black rounded-full border-2 border-black hover:-translate-y-1 text-sm font-bold tracking-widest uppercase shadow-[var(--shadow-solid)] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bento-card bg-white border-2 border-black rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-[var(--shadow-lift)]"
          >
            {!plan.isActive && (
              <div className="absolute top-0 right-0 bg-red-100 border-l-2 border-b-2 border-black text-red-600 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest">
                Disabled
              </div>
            )}

            <div className="inline-block bg-[var(--color-accent-blue)] border-2 border-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest self-start mb-4">
              {plan.badge || plan.tier}
            </div>

            <h3 className="font-display text-2xl font-bold text-black mb-1">{plan.name}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">{plan.tier}</p>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-4xl font-bold text-black">₹{plan.monthlyPrice}</span>
              <span className="text-black/40 font-bold">/mo</span>
            </div>

            <div className="space-y-2 text-sm font-medium text-black/70 mb-6">
              <p>{plan.monthlyBonusCredits} bonus credits / month</p>
              <p>{plan.alaCarteDiscountPercent}% a la carte discount</p>
              <p>
                {plan.maxActiveSubscriptions == null
                  ? 'Unlimited subscriptions'
                  : `Up to ${plan.maxActiveSubscriptions} active subscriptions`}
              </p>
            </div>

            <div className="mt-auto flex justify-end gap-2 border-t border-black/10 pt-4">
              <button
                onClick={() => openModal(plan)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 text-black rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan._id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border-2 border-black rounded-3xl p-8 w-full max-w-lg shadow-[var(--shadow-solid)] max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-3xl font-bold uppercase text-black mb-8">
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                  >
                    <option value="free">free</option>
                    <option value="pro">pro</option>
                    <option value="elite">elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Badge</label>
                  <input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="PRO"
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Monthly Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Bonus Credits</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyBonusCredits}
                    onChange={(e) => setFormData({ ...formData, monthlyBonusCredits: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">A la Carte Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.alaCarteDiscountPercent}
                    onChange={(e) => setFormData({ ...formData, alaCarteDiscountPercent: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Max Subscriptions</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxActiveSubscriptions}
                    onChange={(e) => setFormData({ ...formData, maxActiveSubscriptions: e.target.value })}
                    placeholder="Leave empty = unlimited"
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Perks (one per line)</label>
                <textarea
                  rows={4}
                  value={formData.perks}
                  onChange={(e) => setFormData({ ...formData, perks: e.target.value })}
                  className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="planActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-black"
                />
                <label htmlFor="planActive" className="text-sm font-bold text-black">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-black/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-black/60 hover:text-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black hover:bg-[var(--color-accent-blue)] text-white rounded-full text-sm font-bold uppercase tracking-widest"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
