import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, Sparkles, Copy, CheckSquare } from 'lucide-react';
import { useToast } from '../../lib/toast.jsx';

const buildDraft = ({ hrName, company, role }) => {
  const name = hrName?.trim() || 'there';
  const co = company?.trim() || 'your company';
  const position = role?.trim() || 'the open role';
  const subject = `Quick question about the ${position} role at ${co}`;
  const body = `Hi ${name},

I recently came across the ${position} opening at ${co} and wanted to reach out directly. I'm genuinely excited about the work your team is doing and believe my background lines up well with what you're looking for.

I'd love the chance to briefly share how I could contribute. Would you be open to a short 10-minute chat this week?

Thanks so much for your time.

Best regards,`;
  return { subject, body };
};

export default function QuickDraftPage() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ hrName: '', company: '', role: '' });
  const [draft, setDraft] = useState(null);

  const preview = useMemo(() => draft || buildDraft(form), [draft, form]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleGenerate = () => {
    setDraft(buildDraft(form));
    toast.success('Draft generated.');
  };

  const handleCopy = async () => {
    const text = `Subject: ${preview.subject}\n\n${preview.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard.');
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    navigate('/dashboard/emailer/campaigns/new', {
      state: { subject: preview.subject, body: preview.body }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Inputs */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-4">
        <div className="bento-card p-6 md:p-8 bg-white/50 backdrop-blur-sm">
          <h3 className="font-display text-3xl font-bold uppercase mb-8 flex items-center gap-3">
            <div className="p-2 bg-[var(--color-accent-yellow)]/20 rounded-[12px]">
              <Mail className="h-6 w-6 text-black" />
            </div>{' '}
            Target Info
          </h3>

          <div className="space-y-8">
            <div className="relative group">
              <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">
                HR/Manager Name
              </label>
              <input
                type="text"
                value={form.hrName}
                onChange={handleChange('hrName')}
                className="w-full bg-transparent border-0 border-b-2 border-black/20 px-0 py-2 text-xl font-display font-bold focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder:text-black/20"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="relative group">
              <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">
                Company Name
              </label>
              <input
                type="text"
                value={form.company}
                onChange={handleChange('company')}
                className="w-full bg-transparent border-0 border-b-2 border-black/20 px-0 py-2 text-xl font-display font-bold focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder:text-black/20"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="relative group">
              <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">
                Role Applied For
              </label>
              <input
                type="text"
                value={form.role}
                onChange={handleChange('role')}
                className="w-full bg-transparent border-0 border-b-2 border-black/20 px-0 py-2 text-xl font-display font-bold focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder:text-black/20"
                placeholder="e.g. Frontend Developer"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full pill-btn mt-10 text-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5" /> GENERATE DRAFT
          </button>
        </div>
      </motion.div>

      {/* Output */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2"
      >
        <div className="bento-card p-6 md:p-8 h-full min-h-[400px] flex flex-col bg-white text-black">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 border-b border-black/10 pb-6">
            <h3 className="font-display text-2xl sm:text-4xl font-bold uppercase">Generated Draft</h3>
            <button
              onClick={handleCopy}
              className="pill-btn-secondary px-4 py-2 flex items-center gap-2 text-sm text-black shadow-sm bg-white hover:bg-black/5"
            >
              {copied ? <CheckSquare className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>

          <div className="flex-1 bg-black/5 border border-black/5 p-6 md:p-8 font-body text-base md:text-lg text-black whitespace-pre-wrap rounded-[32px] font-medium leading-relaxed shadow-[var(--shadow-soft)]">
            {`Subject: ${preview.subject}\n\n${preview.body}`}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleCreateCampaign}
              className="pill-btn group bg-black text-white hover:bg-[var(--color-accent-blue)] flex items-center gap-2"
            >
              <Send className="h-5 w-5" /> CREATE CAMPAIGN
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
