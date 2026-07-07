import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Sparkles, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import { resumeApi, pricingApi } from '../../lib/api';
import { useWallet } from '../../context/WalletContext';
import { usePaywall } from '../../context/PaywallContext';
import ResumeEditor from '../../components/resume/ResumeEditor';

export default function ResumeTailorPage() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  const navigate = useNavigate();
  const { refreshWallet } = useWallet();
  const openPaywall = usePaywall();

  const [step, setStep] = useState(resumeId ? 3 : 1);
  const [isLoading, setIsLoading] = useState(resumeId ? true : false);
  const [error, setError] = useState('');

  // Source step state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'

  // Result state
  const [tailoredResume, setTailoredResume] = useState(null);
  const [tailoredTitle, setTailoredTitle] = useState('Untitled Resume');
  const [atsScore, setAtsScore] = useState(null);
  const [savedResumeId, setSavedResumeId] = useState(resumeId);

  const [pricing, setPricing] = useState({ creditCost: 4, cashPriceUsd: 5 });
  const CREDIT_COST = pricing.creditCost;

  useEffect(() => {
    pricingApi
      .getCatalog()
      .then((catalog) => {
        if (catalog && catalog['resume-tailor']) setPricing(catalog['resume-tailor']);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    }
  }, [resumeId]);

  const loadResume = async (id) => {
    try {
      setIsLoading(true);
      const data = await resumeApi.get(id);
      setTailoredResume(data.data);
      setTailoredTitle(data.title || 'Untitled Resume');
      setJobDescription(data.jobDescription || '');
      setAtsScore(data.atsScore);
      setStep(3);
    } catch (err) {
      console.error('Failed to load resume:', err);
      setError('Could not load the saved tailored resume.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Performs the actual tailoring request (optionally redeeming a paid order),
  // driving the analyzing/result steps and its own error handling.
  const performTailor = async (paidOrderId) => {
    setError('');
    setStep(2); // Analyzing step

    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      if (paidOrderId) formData.append('paidOrderId', paidOrderId);

      if (inputMode === 'upload' && resumeFile) {
        formData.append('resumeFile', resumeFile);
      } else if (inputMode === 'paste') {
        formData.append('resumeText', resumeText);
      }

      const response = await resumeApi.tailor(formData);

      setTailoredResume(response.data.data);
      setAtsScore(response.data.atsScore);
      await refreshWallet();
      setStep(3); // Result step
    } catch (err) {
      console.error('Tailor error:', err);
      setError(err.message || 'Failed to analyze and tailor the resume. Please try again.');
      setStep(1);
    }
  };

  const handleTailor = () => {
    if (!jobDescription.trim()) {
      setError('Job Description is required.');
      return;
    }

    if (inputMode === 'upload' && !resumeFile) {
      setError('Please upload a resume file.');
      return;
    }

    if (inputMode === 'paste' && !resumeText.trim()) {
      setError('Please paste your resume text.');
      return;
    }

    setError('');

    // Unified paywall: choose credits or a la carte. The actual tailoring runs
    // once payment is confirmed (fire-and-forget so the modal closes and the
    // analyzing step takes over).
    openPaywall({
      actionId: 'resume-tailor',
      label: 'AI Resume Tailoring',
      description: 'We parse your resume, match it to the job description, and optimize it for ATS.',
      creditCost: pricing.creditCost,
      cashPrice: pricing.cashPriceUsd,
      onPayWithCredits: () => {
        performTailor();
      },
      onPayAlaCarte: (paidOrderId) => {
        performTailor(paidOrderId);
      },
    });
  };

  const handleSaveComplete = (savedResume) => {
    if (!savedResumeId) {
      setSavedResumeId(savedResume._id);
      navigate(`/dashboard/resume-maker/tailor?id=${savedResume._id}`, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 print:hidden">
        <div className="pill-badge bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] w-fit mb-2">AI TAILOR MODE</div>
      </div>

      {error && step !== 2 && (
        <div className="bg-red-50 text-red-900 border border-red-200 p-4 rounded-2xl flex items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium mt-0.5">{error}</p>
          </div>
          {error.toLowerCase().includes('credit') && (
            <button 
              onClick={() => navigate('/dashboard/billing')}
              className="px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-red-700 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Get Credits
            </button>
          )}
        </div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
          <h1 className="font-display text-4xl font-bold uppercase mb-2">Tailor your resume</h1>
          <p className="text-black/60 font-medium mb-8">Upload your existing resume and paste a job description. We'll align your experience with the employer's keywords.</p>

          <div className="bento-card p-6 md:p-8 bg-white border border-black/5 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-2xl font-bold uppercase mb-6">1. Your Resume</h2>
            
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setInputMode('upload')}
                className={`px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition-colors ${inputMode === 'upload' ? 'bg-black text-white' : 'bg-black/5 text-black hover:bg-black/10'}`}
              >
                Upload File
              </button>
              <button 
                onClick={() => setInputMode('paste')}
                className={`px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition-colors ${inputMode === 'paste' ? 'bg-black text-white' : 'bg-black/5 text-black hover:bg-black/10'}`}
              >
                Paste Text
              </button>
            </div>

            {inputMode === 'upload' ? (
              <div>
                {!resumeFile ? (
                  <label className="border-2 border-dashed border-black/20 rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer hover:bg-[var(--color-accent-blue)]/5 hover:border-[var(--color-accent-blue)] group">
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    <Upload className="h-10 w-10 text-black/50 mb-4 group-hover:text-[var(--color-accent-blue)]" />
                    <p className="text-xl font-display font-bold mb-2 group-hover:text-[var(--color-accent-blue)] uppercase">Upload or Drop</p>
                    <div className="pill-badge bg-black/5 text-black">PDF OR DOCX</div>
                  </label>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-white shadow-[var(--shadow-soft)] rounded-[32px] border border-black/5">
                    <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-lg font-bold uppercase truncate">{resumeFile.name}</p>
                      <div className="pill-badge mt-1 bg-black/5 text-black">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button onClick={() => setResumeFile(null)} className="p-2 hover:bg-black/5 rounded-full">
                      <AlertCircle className="w-5 h-5 text-black/40 hover:text-red-500" />
                    </button>
                    <CheckSquare className="h-6 w-6 text-[var(--color-accent-blue)] flex-shrink-0" />
                  </div>
                )}
              </div>
            ) : (
              <textarea 
                className="w-full h-48 bg-white/80 border border-black/10 shadow-inner rounded-[32px] p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 transition-shadow resize-none"
                placeholder="Paste your full resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            )}
          </div>

          <div className="bento-card p-6 md:p-8 bg-white border border-black/5 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-2xl font-bold uppercase mb-6">2. Job Description</h2>
            <textarea 
              className="w-full h-48 bg-white/80 border border-black/10 shadow-inner rounded-[32px] p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 transition-shadow resize-none"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleTailor}
              className="pill-btn bg-[var(--color-accent-blue)] text-white hover:bg-[var(--color-accent-blue)]/90 flex items-center gap-2 text-lg px-8 py-4"
            >
              <Sparkles className="w-5 h-5" /> ANALYZE & TAILOR (-{CREDIT_COST} CR)
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-black/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[var(--color-accent-blue)] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[var(--color-accent-blue)] animate-pulse" />
            </div>
          </div>
          <h2 className="font-display text-4xl font-bold uppercase mb-4">Tailoring your resume...</h2>
          <p className="text-black/60 font-medium">Our AI is parsing your experience, extracting keywords from the JD, and rewriting your bullet points to maximize your ATS match.</p>
          <div className="mt-8 pill-badge bg-black/5 text-black animate-pulse">This usually takes 15-30 seconds</div>
        </div>
      )}

      {step === 3 && tailoredResume && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ResumeEditor 
            initialData={tailoredResume} 
            initialTitle={tailoredTitle}
            mode="tailored" 
            jobDescription={jobDescription}
            atsScore={atsScore}
            resumeId={savedResumeId}
            onSaveComplete={handleSaveComplete}
          />
        </motion.div>
      )}
    </div>
  );
}
