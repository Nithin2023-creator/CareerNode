import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '../../lib/toast';

export default function AdminCreditPacksPage() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [formData, setFormData] = useState({
    name: '', credits: 100, price: 9.99, badge: '', isActive: true
  });

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const res = await adminApi.listCreditPacks();
      setPacks(res);
    } catch (err) {
      toast.error('Failed to fetch packs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pack?')) return;
    try {
      await adminApi.deleteCreditPack(id);
      toast.success('Pack deleted');
      fetchPacks();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const openModal = (pack = null) => {
    if (pack) {
      setEditingPack(pack);
      setFormData({
        name: pack.name, credits: pack.credits, price: pack.price, badge: pack.badge, isActive: pack.isActive
      });
    } else {
      setEditingPack(null);
      setFormData({
        name: '', credits: 100, price: 9.99, badge: '', isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPack) {
        await adminApi.updateCreditPack(editingPack._id, formData);
        toast.success('Pack updated');
      } else {
        await adminApi.createCreditPack(formData);
        toast.success('Pack created');
      }
      setIsModalOpen(false);
      fetchPacks();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">Credit Packs</h1>
          <p className="text-black/50 text-sm font-medium">Manage the pricing and credits granted for top-ups.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-2 bg-[var(--color-accent-yellow)] text-black rounded-full border-2 border-black hover:-translate-y-1 text-sm font-bold tracking-widest uppercase shadow-[var(--shadow-solid)] transition-all">
          <Plus className="w-4 h-4" /> Add Pack
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map(pack => (
          <div key={pack._id} className="bento-card bg-white border-2 border-black rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-[var(--shadow-lift)] hover:-translate-y-1 hover:shadow-[var(--shadow-solid)] transition-all">
            {!pack.isActive && (
              <div className="absolute top-0 right-0 bg-red-100 border-l-2 border-b-2 border-black text-red-600 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest">
                Disabled
              </div>
            )}
            {pack.badge && (
              <div className="inline-block bg-[var(--color-accent-blue)] border-2 border-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest self-start mb-4 shadow-[var(--shadow-soft)]">
                {pack.badge}
              </div>
            )}
            
            <h3 className="font-display text-2xl font-bold text-black mb-2">{pack.name}</h3>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-4xl font-bold text-black">${pack.price}</span>
            </div>

            <div className="bg-black/5 border border-black/10 p-4 rounded-xl mb-6">
              <p className="text-center font-bold text-lg text-yellow-600">{pack.credits} Credits</p>
            </div>

            <div className="mt-auto flex justify-end gap-2 border-t border-black/10 pt-4">
              <button onClick={() => openModal(pack)} className="px-4 py-2 bg-black/5 hover:bg-black/10 text-black rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                Edit
              </button>
              <button 
                onClick={() => handleDelete(pack._id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {packs.length === 0 && (
        <div className="text-center py-12 bento-card bg-white border-2 border-black rounded-2xl text-black/50 font-bold uppercase tracking-widest text-sm">
          No credit packs configured. Wallet page will appear empty.
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border-2 border-black rounded-3xl p-8 w-full max-w-md shadow-[var(--shadow-solid)]">
            <h2 className="font-display text-3xl font-bold uppercase text-black mb-8">{editingPack ? 'Edit Pack' : 'Create Pack'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Pack Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Credits</label>
                  <input type="number" required value={formData.credits} onChange={e => setFormData({...formData, credits: Number(e.target.value)})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Price ($)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Badge Text (Optional)</label>
                <input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="e.g. BEST VALUE" className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-2 border-black text-black focus:ring-black" />
                <label htmlFor="isActive" className="text-sm font-bold text-black">Active (Visible to users)</label>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-black/10 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-black/60 hover:text-black uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-black hover:bg-[var(--color-accent-blue)] text-white border border-transparent hover:border-black rounded-full text-sm font-bold uppercase tracking-widest shadow-[var(--shadow-soft)] transition-all">Save Pack</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
