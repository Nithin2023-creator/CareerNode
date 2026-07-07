import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Paperclip,
  Check,
  Package,
  Mail,
  PlugZap,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { coldMailerApi, bundlesApi, gmailConnectionApi } from '../../lib/api.js';
import { withMockFallback } from '../../lib/apiHelpers.js';
import { useToast } from '../../lib/toast.jsx';
import { useGmailAuth } from '../../lib/gmailAuth.js';
import { STANDARD_FIELDS, TEMPLATE_TOKENS, standardizeRows, renderTemplate, isGmailReady, isGmailRevoked } from './helpers.js';

export default function NewCampaignPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // "source" -> "map" -> "template"
  // If sourceType is bundle, we skip "map" and go straight to "template"
  const [step, setStep] = useState('source'); 
  const [sourceType, setSourceType] = useState(null); // 'csv' or 'bundle'

  const [uploading, setUploading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // CSV State
  const [rawRows, setRawRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});

  // Bundle State
  const [ownedBundles, setOwnedBundles] = useState([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(false);

  // Campaign State
  const [recipients, setRecipients] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(location.state?.subject || '');
  const [body, setBody] = useState(location.state?.body || '');
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);

  const [gmailConnection, setGmailConnection] = useState(null);
  const [checkingGmail, setCheckingGmail] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const bodyRef = useRef(null);

  useEffect(() => {
    fetchGmailStatus();
  }, []);

  const fetchGmailStatus = async () => {
    setCheckingGmail(true);
    try {
      const data = await gmailConnectionApi.getStatus();
      setGmailConnection(data.email ? data : null);
    } catch {
      setGmailConnection(null);
    } finally {
      setCheckingGmail(false);
    }
  };

  const handleGoogleSuccess = async (codeResponse) => {
    try {
      setCheckingGmail(true);
      const data = await gmailConnectionApi.connect(codeResponse.code);
      setGmailConnection(data.email ? data : null);
      toast.success('Gmail connected successfully.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCheckingGmail(false);
    }
  };

  const login = useGmailAuth(handleGoogleSuccess);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      await gmailConnectionApi.testConnection();
      setTestResult({ ok: true, message: 'SMTP connection successful.' });
      toast.success('SMTP connection successful.');
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
      toast.error(err.message);
    } finally {
      setTestingConnection(false);
    }
  };

  // Check router state for preselected bundle
  useEffect(() => {
    if (location.state?.preselectBundleId) {
      setSourceType('bundle');
      setSelectedBundleIds([location.state.preselectBundleId]);
      fetchBundlesAndProceed([location.state.preselectBundleId]);
      // clear the state so a refresh doesn't trigger it again
      window.history.replaceState({}, document.title);
    } else {
      fetchOwnedBundles();
    }
  }, [location.state]);

  const fetchOwnedBundles = async () => {
    setLoadingBundles(true);
    try {
      const res = await withMockFallback(bundlesApi.listPurchasedBundles(), []);
      setOwnedBundles(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBundles(false);
    }
  };

  const fetchBundlesAndProceed = async (bundleIdsToFetch) => {
    setLoadingBundles(true);
    try {
      let allRecipients = [];
      for (const bId of bundleIdsToFetch) {
        const recs = await bundlesApi.getBundleRecipients(bId);
        allRecipients = [...allRecipients, ...recs];
      }
      setRecipients(allRecipients);
      
      // Auto set title if single bundle
      if (bundleIdsToFetch.length === 1 && !title) {
        // we might not have the name if it was preselected without ownedBundles loaded, but let's try
        const b = ownedBundles.find(x => x._id === bundleIdsToFetch[0]);
        if (b) setTitle(`Campaign - ${b.name}`);
      }

      setSourceType('bundle');
      setStep('connect');
    } catch {
      toast.error('Failed to load bundle recipients');
    } finally {
      setLoadingBundles(false);
    }
  };

  const handleBundleProceed = () => {
    if (selectedBundleIds.length === 0) {
      toast.error('Select at least one bundle');
      return;
    }
    fetchBundlesAndProceed(selectedBundleIds);
  };

  const validRecipients = useMemo(
    () => recipients.filter((r) => r.email && r.email.trim() !== ''),
    [recipients]
  );

  const previewRecipient = validRecipients[0] || {};

  // CSV Flow
  const handleFileSelect = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('csvFile', file);
      const data = await coldMailerApi.importCsv(fd);
      setHeaders(data.headers || []);
      setRawRows(data.rows || []);
      setMapping(data.mappedFields || {});
      if (!title) setTitle(file.name.replace(/\.csv$/i, ''));
      toast.success(`Imported ${data.rows?.length || 0} rows.`);
      setSourceType('csv');
      setStep('map');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const buildRecipients = () => standardizeRows(rawRows, mapping);

  const handleContinueToTemplate = () => {
    const hasEmail = Object.values(mapping).includes('email');
    if (!hasEmail) {
      toast.error('Map at least one column to "email" before continuing.');
      return;
    }
    const std = buildRecipients();
    setRecipients(std);
    setStep('connect');
  };

  const handlePolish = async () => {
    setCleaning(true);
    try {
      const std = buildRecipients();
      const cleaned = await coldMailerApi.cleanRows(std);
      const cleanedRows = cleaned.cleanedRows || cleaned;
      setRecipients(cleanedRows);
      toast.success('Data polished with AI.');
      setStep('connect');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCleaning(false);
    }
  };

  const insertToken = (token) => {
    const el = bodyRef.current;
    const snippet = `{{${token}}}`;
    if (!el) {
      setBody((prev) => prev + snippet);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + snippet + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + snippet.length;
    });
  };

  const submit = async () => {
    if (!title.trim() || !subject.trim() || !body.trim()) {
      toast.error('Title, subject, and body are all required.');
      return;
    }
    if (validRecipients.length === 0) {
      toast.error('No recipients with a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('templateSubject', subject);
      fd.append('templateBody', body);
      fd.append('recipients', JSON.stringify(validRecipients));
      if (resumeFile) fd.append('resume', resumeFile);
      if (coverLetterFile) fd.append('coverLetter', coverLetterFile);

      const campaign = await coldMailerApi.createCampaign(fd);
      toast.success('Campaign created as a draft.');
      navigate(`/dashboard/emailer/campaigns/${campaign._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBundleSelection = (id) => {
    setSelectedBundleIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Determine active step index for UI
  const getStepIndex = () => {
    if (step === 'source') return 0;
    if (step === 'map') return 1;
    if (step === 'connect') return sourceType === 'bundle' ? 1 : 2;
    if (step === 'template') return sourceType === 'bundle' ? 2 : 3;
    return 0;
  };

  const stepsList = sourceType === 'bundle' 
    ? ['Choose Source', 'Connect Gmail', 'Template & Launch']
    : ['Choose Source', 'Map & Clean', 'Connect Gmail', 'Template & Launch'];

  const stepIndex = getStepIndex();

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-3">
        {stepsList.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 pill-badge ${
                i === stepIndex
                  ? 'bg-black text-white'
                  : i < stepIndex
                    ? 'bg-[var(--color-accent-yellow)]/25 text-black'
                    : 'bg-black/5 text-black/40'
              }`}
            >
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-white/20 text-[10px]">
                {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {label}
            </div>
            {i < stepsList.length - 1 && <div className="h-px w-6 bg-black/15" />}
          </div>
        ))}
      </div>

      {/* Step 0: Choose Source */}
      {step === 'source' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CSV Upload */}
            <UploadStep uploading={uploading} onFile={handleFileSelect} />

            {/* Bundle Selection */}
            <div className="bento-card p-8 md:p-12 bg-white border border-black/10 flex flex-col h-full">
              <div className="flex flex-col items-center mb-8">
                <div className="p-5 bg-[var(--color-accent-blue)]/20 rounded-[28px] mb-6">
                  <Package className="h-12 w-12 text-[var(--color-accent-blue)]" />
                </div>
                <h3 className="font-display text-3xl font-bold uppercase mb-3 text-center">Use Purchased Bundles</h3>
                <p className="text-black/50 max-w-sm text-center">
                  Select from your HR contact bundles to instantly populate your campaign recipients.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-64 border border-black/10 rounded-2xl p-4 bg-black/[0.02]">
                {loadingBundles ? (
                  <p className="text-center text-black/40 mt-8">Loading bundles...</p>
                ) : ownedBundles.length === 0 ? (
                  <div className="text-center mt-8">
                    <p className="text-black/40 mb-4">You don't own any bundles yet.</p>
                    <button 
                      onClick={() => navigate('/dashboard/emailer/marketplace')}
                      className="text-sm font-bold text-black underline"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ownedBundles.map(bundle => (
                      <label key={bundle._id} className="flex items-start p-3 bg-white rounded-xl border border-black/5 cursor-pointer hover:border-black/20 transition-colors">
                        <input 
                          type="checkbox" 
                          className="mt-1 mr-3"
                          checked={selectedBundleIds.includes(bundle._id)}
                          onChange={() => toggleBundleSelection(bundle._id)}
                        />
                        <div>
                          <h4 className="font-bold">{bundle.name}</h4>
                          <p className="text-xs text-black/50">{bundle.contactCount} contacts • {bundle.category}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleBundleProceed}
                  disabled={selectedBundleIds.length === 0 || loadingBundles}
                  className="bento-button w-full justify-center bg-[var(--color-accent-blue)] text-white hover:bg-[var(--color-accent-blue)]/90 disabled:opacity-50"
                >
                  {loadingBundles ? 'LOADING...' : 'USE SELECTED BUNDLES'}
                  {!loadingBundles && <ArrowRight className="w-4 h-4 ml-2" />}
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* Step 1 (CSV Only): Map & Clean */}
      {step === 'map' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bento-card p-6 md:p-8 bg-white">
            <h3 className="font-display text-3xl font-bold uppercase mb-2">Map Columns</h3>
            <p className="text-black/50 mb-6">
              We auto-detected these mappings with AI. Adjust any column, then optionally polish the data.
              <span className="font-bold text-black"> {rawRows.length} rows</span> imported.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.map((header) => (
                <div
                  key={header}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-4 rounded-[20px] bg-black/[0.03]"
                >
                  <span className="font-display font-bold truncate" title={header}>
                    {header}
                  </span>
                  <select
                    value={mapping[header] || 'dynamicData'}
                    onChange={(e) => setMapping((prev) => ({ ...prev, [header]: e.target.value }))}
                    className="w-full sm:w-auto sm:min-w-[160px] bg-white border border-black/10 rounded-full px-4 py-2 text-sm font-bold focus:outline-none focus:border-black"
                  >
                    {STANDARD_FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button onClick={() => setStep('source')} className="pill-btn-secondary flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> BACK
            </button>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePolish}
                disabled={cleaning}
                className="pill-btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" /> {cleaning ? 'POLISHING…' : 'POLISH WITH AI'}
              </button>
              <button onClick={handleContinueToTemplate} className="pill-btn flex items-center gap-2">
                CONTINUE <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step X: Connect Gmail */}
      {step === 'connect' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bento-card p-6 md:p-8 bg-white max-w-2xl mx-auto">
            <h3 className="font-display text-3xl font-bold uppercase mb-2 text-center">Gmail Connection</h3>
            <p className="text-black/50 mb-8 text-center">
              Verify your Gmail account is connected to send the campaign.
            </p>

            {checkingGmail ? (
              <div className="space-y-3 mt-6">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 rounded-[20px] bg-black/[0.03] animate-pulse" />
                ))}
              </div>
            ) : isGmailReady(gmailConnection) ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="p-2 bg-emerald-500/20 rounded-[12px] shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-black/40">Connected Account</p>
                      <p className="font-display font-bold text-lg text-emerald-900">{gmailConnection.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="pill-btn-secondary bg-white whitespace-nowrap text-sm px-4 py-2 disabled:opacity-50"
                  >
                    <PlugZap className="h-4 w-4 mr-2 inline-block" />
                    {testingConnection ? 'TESTING...' : 'TEST CONNECTION'}
                  </button>
                </div>
                {testResult && (
                  <div
                    className={`flex items-start gap-2 rounded-[16px] p-3 text-sm font-medium ${
                      testResult.ok ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            ) : isGmailRevoked(gmailConnection) ? (
              <div className="p-8 rounded-[20px] bg-red-500/5 text-center border-2 border-dashed border-red-500/20 mb-6">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h4 className="font-display text-xl font-bold uppercase mb-2">Access Revoked</h4>
                <p className="text-sm text-black/50 max-w-md mx-auto mb-6">
                  Google revoked CareerNode&apos;s permission to send on your behalf. Click below to reconnect.
                </p>
                <button onClick={() => login()} className="pill-btn inline-flex items-center justify-center gap-2">
                  <PlugZap className="h-5 w-5" /> RECONNECT WITH GOOGLE
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-[20px] bg-black/[0.03] text-center border-2 border-dashed border-black/10">
                <Mail className="h-12 w-12 text-black/20 mx-auto mb-4" />
                <h4 className="font-display text-xl font-bold uppercase mb-2">Not Connected</h4>
                <p className="text-sm text-black/50 max-w-md mx-auto mb-6">
                  You need to authorize CareerNode to send emails on your behalf to launch campaigns.
                </p>
                <button onClick={() => login()} className="pill-btn inline-flex items-center justify-center gap-2">
                  <PlugZap className="h-5 w-5" /> CONNECT WITH GOOGLE
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 max-w-2xl mx-auto">
            <button 
              onClick={() => {
                if (sourceType === 'bundle') setStep('source');
                else setStep('map');
              }} 
              className="pill-btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> BACK
            </button>
            <button
              onClick={() => setStep('template')}
              disabled={checkingGmail || !isGmailReady(gmailConnection)}
              className="pill-btn flex items-center gap-2 disabled:opacity-50"
            >
              CONTINUE <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Template & Launch */}
      {step === 'template' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bento-card p-6 md:p-8 bg-white/60 backdrop-blur-sm space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">
                    Campaign Name
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-black/20 px-0 py-2 text-lg font-display font-bold focus:outline-none focus:border-black placeholder:text-black/20"
                    placeholder="Spring Outreach"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">
                    Subject
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-black/20 px-0 py-2 text-lg font-display font-bold focus:outline-none focus:border-black placeholder:text-black/20"
                    placeholder="Application for {{role}} at {{companyName}}"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">
                    Insert Token
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATE_TOKENS.map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => insertToken(token)}
                        className="pill-badge bg-[var(--color-accent-yellow)]/20 hover:bg-[var(--color-accent-yellow)]/40 transition-colors cursor-pointer"
                      >
                        {`{{${token}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">
                    Body
                  </label>
                  <textarea
                    ref={bodyRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-[20px] px-4 py-3 text-sm font-medium leading-relaxed focus:outline-none focus:border-black resize-y"
                    placeholder={`Hi {{hrName}},\n\nI'm reaching out about the {{role}} role at {{companyName}}...`}
                  />
                </div>

                <div className="space-y-3">
                  <AttachmentInput
                    label="Resume"
                    file={resumeFile}
                    onChange={setResumeFile}
                    accept=".pdf,.doc,.docx"
                  />
                  <AttachmentInput
                    label="Cover Letter"
                    file={coverLetterFile}
                    onChange={setCoverLetterFile}
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="bento-card p-6 md:p-8 bg-white h-full flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b border-black/10 pb-5">
                  <h3 className="font-display text-3xl font-bold uppercase">Live Preview</h3>
                  <span className="pill-badge bg-black/5">
                    {validRecipients.length} recipient{validRecipients.length === 1 ? '' : 's'}
                  </span>
                </div>

                {validRecipients.length > 0 && (
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">
                    Previewing for {previewRecipient.email}
                  </p>
                )}

                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-black/50">Subject</span>
                  <p className="font-display font-bold text-lg mt-1">
                    {renderTemplate(subject, previewRecipient) || (
                      <span className="text-black/25">Your subject line…</span>
                    )}
                  </p>
                </div>

                <div className="flex-1 bg-black/[0.03] border border-black/5 p-6 rounded-[24px] whitespace-pre-wrap font-medium leading-relaxed text-black min-h-[220px]">
                  {renderTemplate(body, previewRecipient) || (
                    <span className="text-black/25">Your email body will render here…</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button 
              onClick={() => setStep('connect')} 
              className="pill-btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> BACK
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="pill-btn flex items-center gap-2 text-lg disabled:opacity-50 bg-black text-white"
            >
              <Rocket className="h-5 w-5" /> {submitting ? 'CREATING…' : 'CREATE CAMPAIGN'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function UploadStep({ uploading, onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  return (
    <div
      className={`bento-card p-12 md:p-16 bg-white text-center border-2 border-dashed transition-colors flex flex-col h-full justify-center ${
        dragging ? 'border-black bg-black/[0.02]' : 'border-black/15'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="flex flex-col items-center">
        <div className="p-5 bg-[var(--color-accent-yellow)]/20 rounded-[28px] mb-6">
          <UploadCloud className="h-12 w-12 text-black" />
        </div>
        <h3 className="font-display text-3xl font-bold uppercase mb-3">Upload your CSV</h3>
        <p className="text-black/50 max-w-sm mb-8">
          Drag and drop a CSV of contacts here. We'll use AI to auto-map your columns.
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="pill-btn flex items-center gap-2 disabled:opacity-50"
        >
          <FileText className="h-5 w-5" /> {uploading ? 'IMPORTING…' : 'BROWSE FILES'}
        </button>
      </div>
    </div>
  );
}

function AttachmentInput({ label, file, onChange, accept }) {
  const inputRef = useRef(null);
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2 block">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-[20px] bg-black/[0.03] border border-black/10 hover:border-black/30 transition-colors text-sm font-bold text-left"
      >
        <Paperclip className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{file ? file.name : `Attach ${label.toLowerCase()} (optional)`}</span>
      </button>
    </div>
  );
}
