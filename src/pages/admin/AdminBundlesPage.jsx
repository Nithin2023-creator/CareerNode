import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Loader2, Plus, Edit2, Trash2, UploadCloud } from 'lucide-react';
import { useToast } from '../../lib/toast';

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: '', region: '', description: '', contactCount: 0, creditCost: 20, alaCartePrice: 29.99
  });
  const [csvContent, setCsvContent] = useState('');

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await adminApi.listBundles();
      setBundles(res);
    } catch (err) {
      toast.error('Failed to fetch bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;
    try {
      await adminApi.deleteBundle(id);
      toast.success('Bundle deleted');
      fetchBundles();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const openModal = (bundle = null) => {
    if (bundle) {
      setEditingBundle(bundle);
      setFormData({
        name: bundle.name, category: bundle.category, region: bundle.region,
        description: bundle.description, contactCount: bundle.contactCount,
        creditCost: bundle.creditCost, alaCartePrice: bundle.alaCartePrice
      });
    } else {
      setEditingBundle(null);
      setFormData({
        name: '', category: '', region: '', description: '', contactCount: 0, creditCost: 20, alaCartePrice: 29.99
      });
    }
    setIsModalOpen(true);
  };

  const openCsvModal = (bundle) => {
    setEditingBundle(bundle);
    setCsvContent('');
    setIsCsvModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingBundle) {
        await adminApi.updateBundle(editingBundle._id, formData);
        toast.success('Bundle updated');
      } else {
        await adminApi.createBundle(formData);
        toast.success('Bundle created');
      }
      setIsModalOpen(false);
      fetchBundles();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    try {
      // Basic CSV parsing for demo
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const companyIdx = headers.findIndex(h => h.includes('company'));
      
      if (emailIdx === -1) throw new Error('CSV must contain an email column');

      const contacts = lines.slice(1).map(line => {
        const parts = line.split(',');
        return {
          email: parts[emailIdx]?.trim(),
          hrName: nameIdx !== -1 ? parts[nameIdx]?.trim() : '',
          companyName: companyIdx !== -1 ? parts[companyIdx]?.trim() : ''
        };
      }).filter(c => c.email);

      await adminApi.uploadBundleContacts(editingBundle._id, contacts);
      toast.success(`Uploaded ${contacts.length} contacts`);
      setIsCsvModalOpen(false);
      fetchBundles();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">HR Bundles</h1>
          <p className="text-black/50 text-sm font-medium">Manage email contact lists for Cold Mailer.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full border border-black hover:bg-[var(--color-accent-blue)] text-sm font-bold tracking-widest uppercase shadow-[var(--shadow-soft)] transition-colors">
          <Plus className="w-4 h-4" /> Create Bundle
        </button>
      </div>

      <div className="bento-card bg-white border-2 border-black rounded-2xl shadow-[var(--shadow-lift)] overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black text-white font-bold uppercase tracking-widest text-[10px]">
            <tr>
              <th className="px-6 py-4">Bundle Name</th>
              <th className="px-6 py-4">Category & Region</th>
              <th className="px-6 py-4">Contacts</th>
              <th className="px-6 py-4">Pricing</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-black font-medium divide-y divide-black/10">
            {bundles.map(bundle => (
              <tr key={bundle._id} className="hover:bg-[var(--color-bg)] transition-colors">
                <td className="px-6 py-4 font-bold text-black">{bundle.name}</td>
                <td className="px-6 py-4">
                  <span className="block font-bold text-black">{bundle.category}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">{bundle.region}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-black bg-black/5 px-2 py-1 rounded border border-black/10">{bundle.contactCount}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="block text-yellow-600 font-bold text-xs">{bundle.creditCost} Credits</span>
                  <span className="text-xs text-black/60">${bundle.alaCartePrice} a la carte</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <button 
                    onClick={() => openCsvModal(bundle)}
                    title="Upload CSV"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <UploadCloud className="w-3 h-3" />
                    CSV
                  </button>
                  <button onClick={() => openModal(bundle)} className="p-1.5 text-black/40 hover:text-black transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(bundle._id)} className="p-1.5 text-red-500/80 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {bundles.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-12 text-center font-bold text-black/40 uppercase tracking-widest text-sm">No bundles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border-2 border-black rounded-3xl p-8 w-full max-w-xl shadow-[var(--shadow-solid)]">
            <h2 className="font-display text-3xl font-bold uppercase text-black mb-8">{editingBundle ? 'Edit Bundle' : 'Create Bundle'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Bundle Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Category</label>
                  <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Region</label>
                <input required value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Credit Cost</label>
                  <input type="number" required value={formData.creditCost} onChange={e => setFormData({...formData, creditCost: Number(e.target.value)})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">A la Carte Price ($)</label>
                  <input type="number" step="0.01" required value={formData.alaCartePrice} onChange={e => setFormData({...formData, alaCartePrice: Number(e.target.value)})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-black/10 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-black/60 hover:text-black uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-black hover:bg-[var(--color-accent-blue)] text-white border border-transparent hover:border-black rounded-full text-sm font-bold uppercase tracking-widest shadow-[var(--shadow-soft)] transition-all">Save Bundle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCsvModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg)] border-2 border-black rounded-3xl p-8 w-full max-w-xl shadow-[var(--shadow-solid)]">
            <h2 className="font-display text-3xl font-bold uppercase text-black mb-2">Upload Contacts CSV</h2>
            <p className="text-black/50 font-medium text-sm mb-6">Target: <span className="font-bold text-black">{editingBundle?.name}</span></p>
            <form onSubmit={handleCsvUpload} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Upload CSV File</label>
                <input 
                  type="file" 
                  accept=".csv"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setCsvContent(e.target.result);
                      reader.readAsText(file);
                    }
                  }}
                  className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black font-medium file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-2 file:border-black file:text-xs file:font-bold file:bg-[var(--color-accent-blue)] file:text-white hover:file:bg-black cursor-pointer" 
                />
                {csvContent && <p className="mt-3 text-xs font-bold uppercase tracking-widest text-green-600">CSV data loaded ({csvContent.trim().split('\n').length - 1} rows).</p>}
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-black/10 mt-6">
                <button type="button" onClick={() => setIsCsvModalOpen(false)} className="px-6 py-2 text-sm font-bold text-black/60 hover:text-black uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white border-2 border-transparent hover:border-black rounded-full text-sm font-bold uppercase tracking-widest shadow-[var(--shadow-soft)] transition-all">Upload Contacts</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
