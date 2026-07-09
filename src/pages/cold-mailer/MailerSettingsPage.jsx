import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, PlugZap, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import { gmailConnectionApi } from '../../lib/api.js';
import { useGmailAuth } from '../../lib/gmailAuth.js';
import { useToast } from '../../lib/toast.jsx';
import { isGmailReady } from './helpers.js';
import GoogleConnectPrepModal from '../../components/cold-mailer/GoogleConnectPrepModal.jsx';

export default function MailerSettingsPage() {
  const toast = useToast();
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const connectingRef = useRef(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await gmailConnectionApi.getStatus();
      setConnection(data.email ? data : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGoogleSuccess = async (codeResponse) => {
    if (connectingRef.current) return;
    if (!codeResponse?.code) {
      toast.error('Google did not return an authorization code. Please try again.');
      return;
    }

    connectingRef.current = true;
    try {
      setLoading(true);
      const data = await gmailConnectionApi.connect(codeResponse.code);
      setConnection(data.email ? data : null);
      toast.success('Gmail connected successfully.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      connectingRef.current = false;
      setLoading(false);
    }
  };

  const login = useGmailAuth(handleGoogleSuccess);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      await gmailConnectionApi.testConnection();
      setResult({ ok: true, message: 'SMTP connection successful.' });
      toast.success('SMTP connection successful.');
    } catch (err) {
      setResult({ ok: false, message: err.message });
      toast.error(err.message);
    } finally {
      setTesting(false);
      await fetchStatus();
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Gmail account?')) return;
    try {
      setLoading(true);
      await gmailConnectionApi.disconnect();
      setConnection(null);
      toast.success('Gmail disconnected.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isActive = isGmailReady(connection);
  const isRevoked = connection?.status === 'revoked';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <div className="bento-card p-6 md:p-8 bg-white h-full">
          <h3 className="font-display text-3xl font-bold uppercase mb-2">Gmail Connection</h3>
          
          {loading ? (
            <div className="space-y-3 mt-6">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 rounded-[20px] bg-black/[0.03] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600 font-medium mt-6">{error}</p>
          ) : isActive ? (
            <>
              <p className="text-black/50 mb-8">
                Your Gmail account is connected and ready to send cold emails.
              </p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-[20px] bg-black/[0.03]">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-[12px] shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-black/40">Connected Account</p>
                      <p className="font-display font-bold text-lg">{connection.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600">
                      active
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-4">
                  <button onClick={handleDisconnect} className="pill-btn flex items-center justify-center gap-2 bg-black/[0.03] text-black hover:bg-red-500/10 hover:text-red-600 border border-black/10">
                    <LogOut className="h-5 w-5" /> DISCONNECT GMAIL
                  </button>
                </div>
              </div>
            </>
          ) : isRevoked ? (
            <>
              <p className="text-black/50 mb-8">
                Your Gmail access was revoked. Reconnect to resume sending campaigns.
              </p>

              <div className="p-8 rounded-[20px] bg-red-500/5 text-center border-2 border-dashed border-red-500/20 mb-6">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h4 className="font-display text-xl font-bold uppercase mb-2">Access Revoked</h4>
                <p className="text-sm text-black/50 max-w-md mx-auto mb-2">
                  {connection.email}
                </p>
                <p className="text-sm text-black/50 max-w-md mx-auto mb-6">
                  Google revoked CareerNode&apos;s permission to send on your behalf. Click below to reconnect.
                </p>
                <button onClick={() => setShowPrepModal(true)} className="pill-btn inline-flex items-center justify-center gap-2">
                  <PlugZap className="h-5 w-5" /> RECONNECT WITH GOOGLE
                </button>
              </div>

              <button onClick={handleDisconnect} className="pill-btn flex items-center justify-center gap-2 bg-black/[0.03] text-black hover:bg-red-500/10 hover:text-red-600 border border-black/10">
                <LogOut className="h-5 w-5" /> REMOVE ACCOUNT
              </button>
            </>
          ) : (
            <>
              <p className="text-black/50 mb-8">
                Connect your Gmail account to send cold emails securely via OAuth — no app passwords needed.
              </p>
              
              <div className="p-8 rounded-[20px] bg-black/[0.03] text-center border-2 border-dashed border-black/10">
                <Mail className="h-12 w-12 text-black/20 mx-auto mb-4" />
                <h4 className="font-display text-xl font-bold uppercase mb-2">Not Connected</h4>
                <p className="text-sm text-black/50 max-w-md mx-auto mb-6">
                  You need to authorize CareerNode to send emails on your behalf to launch campaigns.
                </p>
                <button onClick={() => setShowPrepModal(true)} className="pill-btn inline-flex items-center justify-center gap-2">
                  <PlugZap className="h-5 w-5" /> CONNECT WITH GOOGLE
                </button>
              </div>
            </>
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
            Verify the server can authenticate with your Gmail account before launching a campaign.
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
            disabled={testing || !isActive}
            className="pill-btn mt-auto flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlugZap className="h-5 w-5" /> {testing ? 'TESTING…' : 'TEST CONNECTION'}
          </button>
        </div>
      </motion.div>

      <GoogleConnectPrepModal
        isOpen={showPrepModal}
        onClose={() => setShowPrepModal(false)}
        onContinue={login}
      />
    </div>
  );
}
