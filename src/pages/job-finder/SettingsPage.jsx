import React, { useState, useEffect } from 'react';
import { Save, Key, Mail, Bell, Target, MapPin, Briefcase, Sparkles } from 'lucide-react';
import { jobFinderApi } from '../../lib/api';
import { withMockFallback } from './helpers';
import { mockSettings, mockMatchProfile } from './mockData';
import { useToast } from '../../lib/toast';

export default function SettingsPage() {
  const toast = useToast();
  
  // Combine settings and profile for simplicity in this mock
  const [formData, setFormData] = useState({
    targetRoles: '',
    preferredLocation: '',
    experienceLevel: '',
    additionalRequirements: '',
    groqApiKey: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    defaultRecipient: '',
    digestFrequency: 'daily'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRes = await withMockFallback(jobFinderApi.getSettings(), mockSettings);
        // We'd typically have a separate getProfile endpoint, mocking it together here
        const profileRes = mockMatchProfile; 
        
        setFormData({ ...settingsRes, ...profileRes });
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await withMockFallback(jobFinderApi.updateSettings(formData), { success: true });
      toast.success('Settings and Profile saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black/40 font-bold uppercase tracking-widest text-sm">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Match Profile Section */}
        <div className="bento-card bg-white p-6 md:p-8 border border-black/5">
          <div className="flex items-center gap-3 mb-6 border-b border-black/10 pb-4">
            <Target className="h-6 w-6 text-[var(--color-accent-blue)]" />
            <h2 className="font-display text-2xl font-bold uppercase">Global Match Profile</h2>
          </div>
          
          <p className="text-black/50 font-medium mb-6">
            These preferences are used by the AI engine to evaluate every job found across all your active subscriptions.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Target Roles
              </label>
              <input
                type="text"
                name="targetRoles"
                value={formData.targetRoles}
                onChange={handleChange}
                placeholder="e.g. Frontend Engineer, React Developer"
                className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Preferred Location
                </label>
                <input
                  type="text"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleChange}
                  placeholder="e.g. Remote, US, New York"
                  className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] appearance-none"
                >
                  <option value="Entry-Level">Entry-Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Staff/Principal">Staff/Principal</option>
                  <option value="Manager/Director">Manager/Director</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Additional AI Instructions
              </label>
              <textarea
                name="additionalRequirements"
                value={formData.additionalRequirements}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Must use React. No management roles. Prefer B2B SaaS companies."
                className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Integrations */}
        <div className="bento-card bg-white p-6 md:p-8 border border-black/5">
          <div className="flex items-center gap-3 mb-6 border-b border-black/10 pb-4">
            <Bell className="h-6 w-6 text-[var(--color-accent-yellow)]" />
            <h2 className="font-display text-2xl font-bold uppercase">Notification Delivery</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Digest Frequency</label>
              <select
                name="digestFrequency"
                value={formData.digestFrequency}
                onChange={handleChange}
                className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] appearance-none"
              >
                <option value="instant">Instant (Email on every match)</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-black/5">
              <label className="block text-xs font-bold uppercase tracking-widest text-black/60 flex items-center gap-2">
                <Mail className="h-4 w-4" /> SMTP Settings (For Emails)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="smtpHost"
                  value={formData.smtpHost}
                  onChange={handleChange}
                  placeholder="SMTP Host"
                  className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                />
                <input
                  type="text"
                  name="smtpPort"
                  value={formData.smtpPort}
                  onChange={handleChange}
                  placeholder="SMTP Port"
                  className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-black/5">
              <label className="block text-xs font-bold uppercase tracking-widest text-black/60 flex items-center gap-2">
                <Key className="h-4 w-4" /> AI Engine
              </label>
              <input
                type="password"
                name="groqApiKey"
                value={formData.groqApiKey}
                onChange={handleChange}
                placeholder="Groq API Key (sk-...)"
                className="w-full bg-black/5 border border-black/10 rounded-[16px] px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
              />
              <p className="text-[10px] font-bold uppercase text-black/40 mt-1">Required for custom scraping and matching.</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="pill-btn bg-[var(--color-accent-blue)] text-white hover:bg-black disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'SAVING...' : 'SAVE CONFIGURATION'}
          </button>
        </div>
      </form>
    </div>
  );
}
