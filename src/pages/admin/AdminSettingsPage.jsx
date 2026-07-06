import React from 'react';
import { Settings, Shield, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">System Settings</h1>
        <p className="text-white/50 text-sm">Platform configuration and API integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Scraper Limits */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 text-white/50 text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="w-4 h-4 text-blue-400" /> Scraper Engine Config
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">Max Pages to Scrape (Generic)</label>
              <input type="number" defaultValue={20} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">Scrape Concurrency</label>
              <input type="number" defaultValue={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="px-4 py-2 bg-white text-black rounded text-sm font-bold mt-4">Save Config</button>
          </div>
        </div>

        {/* AI Key */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 text-white/50 text-xs font-bold uppercase tracking-widest mb-6">
            <Key className="w-4 h-4 text-purple-400" /> Groq AI Integration
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">API Key</label>
              <input type="password" defaultValue="gsk_******************************" disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed" />
              <p className="text-[10px] text-white/40 mt-2">Loaded from .env (GROQ_API_KEY). Change this on the server directly.</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-bold text-green-400">Connection Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
