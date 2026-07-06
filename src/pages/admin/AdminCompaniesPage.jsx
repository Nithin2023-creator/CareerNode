import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Loader2, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../../lib/toast';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState({});
  const toast = useToast();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '', logoUrl: '', category: '', tier: 'standard',
    description: '', careersPageUrl: '', creditCost: 10, alaCartePrice: 14.99, isActive: true
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await adminApi.listCompanies();
      setCompanies(res);
    } catch (err) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (id) => {
    setIsScraping(prev => ({ ...prev, [id]: true }));
    try {
      const res = await adminApi.scrapeCompany(id);
      toast.success(`Scraped successfully. Found ${res.stats.totalJobs} jobs.`);
      fetchCompanies(); // refresh to update openRoles count
    } catch (err) {
      toast.error(err.message || 'Scrape failed');
    } finally {
      setIsScraping(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await adminApi.deleteCompany(id);
      toast.success('Company deleted');
      fetchCompanies();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const openModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name, logoUrl: company.logoUrl, category: company.category,
        tier: company.tier, description: company.description, careersPageUrl: company.careersPageUrl,
        creditCost: company.creditCost, alaCartePrice: company.alaCartePrice, isActive: company.isActive
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '', logoUrl: '', category: '', tier: 'standard',
        description: '', careersPageUrl: '', creditCost: 10, alaCartePrice: 14.99, isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await adminApi.updateCompany(editingCompany._id, formData);
        toast.success('Company updated');
      } else {
        await adminApi.createCompany(formData);
        toast.success('Company created');
      }
      setIsModalOpen(false);
      fetchCompanies();
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
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">Job Finder Companies</h1>
          <p className="text-black/50 text-sm font-medium">Manage marketplace listings and scraper targets.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full border border-black hover:bg-[var(--color-accent-blue)] text-sm font-bold tracking-widest uppercase shadow-[var(--shadow-soft)] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      <div className="bento-card bg-white border-2 border-black rounded-2xl shadow-[var(--shadow-lift)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black text-white font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Tier & Price</th>
                <th className="px-6 py-4">Scraper URL</th>
                <th className="px-6 py-4">Open Roles</th>
                <th className="px-6 py-4">Last Scraped</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-black font-medium divide-y divide-black/10">
              {companies.map(company => (
                <tr key={company._id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt="" className="w-8 h-8 rounded border border-black/10 bg-white" />
                    ) : (
                      <div className="w-8 h-8 rounded border border-black/10 bg-black/5" />
                    )}
                    <div>
                      <div className="font-bold text-black">{company.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">{company.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      company.tier === 'premium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-black/5 text-black/60 border border-black/10'
                    }`}>
                      {company.tier}
                    </span>
                    <div className="mt-1 text-xs text-black/60">{company.creditCost} credits</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate" title={company.careersPageUrl}>
                    {company.careersPageUrl}
                  </td>
                  <td className="px-6 py-4 text-center">{company.openRoles}</td>
                  <td className="px-6 py-4 text-black/40 text-xs">
                    {company.lastScrapedAt ? new Date(company.lastScrapedAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleScrape(company._id)}
                      disabled={isScraping[company._id]}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/5 hover:bg-black/10 text-black border border-transparent hover:border-black/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isScraping[company._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Scrape
                    </button>
                    <button onClick={() => openModal(company)} className="p-1.5 text-black/40 hover:text-black transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(company._id)} className="p-1.5 text-red-400/80 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-12 text-center font-bold text-black/40 uppercase tracking-widest text-sm">No companies found. Add one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border-2 border-black rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[var(--shadow-solid)]">
            <h2 className="font-display text-3xl font-bold uppercase text-black mb-8">{editingCompany ? 'Edit Company' : 'Add Company'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Company Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Category</label>
                  <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Logo URL</label>
                <input value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Careers Page URL (Scraper Target)</label>
                <input required value={formData.careersPageUrl} onChange={e => setFormData({...formData, careersPageUrl: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black h-24" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Tier</label>
                  <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black">
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Credit Cost</label>
                  <input type="number" required value={formData.creditCost} onChange={e => setFormData({...formData, creditCost: Number(e.target.value)})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">A la Carte Price ($)</label>
                  <input type="number" step="0.01" required value={formData.alaCartePrice} onChange={e => setFormData({...formData, alaCartePrice: Number(e.target.value)})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-2 border-black text-black focus:ring-black" />
                <label htmlFor="isActive" className="text-sm font-bold text-black">Active in Marketplace</label>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-black/10 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-black/60 hover:text-black uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-black hover:bg-[var(--color-accent-blue)] text-white border border-transparent hover:border-black rounded-full text-sm font-bold uppercase tracking-widest shadow-[var(--shadow-soft)] transition-all">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
