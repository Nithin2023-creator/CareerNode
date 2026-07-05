import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Mail, Hash, User, PlugZap, CheckCircle2, XCircle } from 'lucide-react';
import { coldMailerApi } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';

export default function MailerSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await coldMailerApi.getSmtpSettings();
        setSettings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      await coldMailerApi.testSmtpConnection();
      setResult({ ok: true, message: 'SMTP connection successful.' });
      toast.success('SMTP connection successful.');
    } catch (err) {
      setResult({ ok: false, message: err.message });
      toast.error(err.message);
    } finally {
      setTesting(false);
    }
  };

  const rows = settings
    ? [
        { icon: Mail, label: 'From Address', value: settings.email },
        { icon: User, label: 'From Name', value: settings.fromName },
        { icon: Server, label: 'SMTP Host', value: settings.host },
        { icon: Hash, label: 'SMTP Port', value: settings.port },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <div className="bento-card p-6 md:p-8 bg-white">
          <h3 className="font-display text-3xl font-bold uppercase mb-2">SMTP Configuration</h3>
          <p className="text-black/50 mb-8">
            These credentials are configured on the server (<span className="font-bold">server/.env</span>) and
            shown here masked for safety.
          </p>

          {loading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-[20px] bg-black/[0.03] animate-pulse" />
              ))}
            </div>
          )}

          {error && !loading && <p className="text-red-600 font-medium">{error}</p>}

          {settings && !loading && (
            <div className="space-y-3">
              {rows.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="flex items-center gap-4 p-4 rounded-[20px] bg-black/[0.03]"
                  >
                    <div className="p-2 bg-white rounded-[12px] shadow-sm">
                      <Icon className="h-5 w-5 text-black" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest text-black/40">{row.label}</p>
                      <p className="font-display font-bold text-lg truncate">{row.value || '—'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-1"
      >
        <div className="bento-card p-6 md:p-8 bg-white/60 backdrop-blur-sm h-full flex flex-col">
          <div className="p-3 bg-[var(--color-accent-yellow)]/20 rounded-[16px] w-fit mb-5">
            <PlugZap className="h-6 w-6 text-black" />
          </div>
          <h3 className="font-display text-2xl font-bold uppercase mb-2">Test Connection</h3>
          <p className="text-black/50 text-sm mb-6">
            Verify the server can authenticate with your mail provider before launching a campaign.
          </p>

          {result && (
            <div
              className={`flex items-start gap-2 rounded-[16px] p-3 mb-6 text-sm font-medium ${
                result.ok ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'
              }`}
            >
              {result.ok ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <button
            onClick={handleTest}
            disabled={testing}
            className="pill-btn mt-auto flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlugZap className="h-5 w-5" /> {testing ? 'TESTING…' : 'TEST CONNECTION'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
