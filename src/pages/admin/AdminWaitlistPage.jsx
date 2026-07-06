import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '../../lib/toast';

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await adminApi.listWaitlist();
      setEntries(res);
    } catch (err) {
      toast.error('Failed to fetch waitlist');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Email', 'Tool', 'Wants Insider', 'Date Joined'];
    const csvContent = [
      headers.join(','),
      ...entries.map(e => [
        e.email,
        e.tool,
        e.wantsInsider ? 'Yes' : 'No',
        new Date(e.createdAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `careernode_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2 uppercase">Waitlist</h1>
          <p className="text-black/50 text-sm font-medium">Users waiting for early access.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full border-2 border-black hover:-translate-y-1 text-sm font-bold tracking-widest uppercase shadow-[var(--shadow-solid)] transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bento-card bg-white border-2 border-black rounded-2xl shadow-[var(--shadow-lift)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black text-white font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Tool Requested</th>
                <th className="px-6 py-4">Newsletter</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-black font-medium divide-y divide-black/10">
              {entries.map(entry => (
                <tr key={entry._id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4 font-bold">{entry.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-black/5 border border-black/10 rounded-md text-[10px] uppercase tracking-widest font-bold">
                      {entry.tool}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {entry.wantsInsider ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 text-black/50">{new Date(entry.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center font-bold text-black/40 uppercase tracking-widest text-sm">No entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
