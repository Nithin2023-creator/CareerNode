import React, { useRef, useState } from 'react';
import { Download, Save } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { usePaywall } from '../../context/PaywallContext';
import { resumeApi, pricingApi } from '../../lib/api';
import ResumePreview from './ResumePreview';
import AtsScoreCard from './AtsScoreCard';
import '../../styles/resumePrint.css';
import { useToast } from '../../lib/toast';
import { downloadResumePdf } from '../../lib/resumePdfExport';
import {
  PersonalInfoSection,
  EducationSection,
  SkillsSection,
  ExperienceSection,
  ProjectsSection,
  PublicationsSection,
  AchievementsSection
} from './ResumeFormSections';

const DEFAULT_RESUME_DATA = {
  personalInfo: { fullName: '', phone: '', email: '', linkedin: '', github: '' },
  education: [],
  skills: [],
  experience: [],
  projects: [],
  publications: [],
  achievements: [],
};

export default function ResumeEditor({ 
  initialData, 
  initialTitle = 'Untitled Resume',
  mode = 'scratch', 
  jobDescription = '', 
  atsScore: initialAtsScore,
  resumeId = null,
  onSaveComplete
}) {
  const { refreshWallet } = useWallet();
  const toast = useToast();
  const openPaywall = usePaywall();
  
  const [data, setData] = useState(initialData || DEFAULT_RESUME_DATA);
  const [title, setTitle] = useState(initialTitle);
  const [atsScore, setAtsScore] = useState(initialAtsScore);
  const [mobileTab, setMobileTab] = useState('edit');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  
  const printRef = useRef(null);
  const exportRef = useRef(null);

  // Pricing for the export action (dynamic from the catalog, with a fallback).
  const [pricing, setPricing] = useState({ creditCost: 2, cashPriceInr: 3 });
  React.useEffect(() => {
    pricingApi
      .getCatalog()
      .then((catalog) => {
        if (catalog && catalog['resume-export']) setPricing(catalog['resume-export']);
      })
      .catch(() => {});
  }, []);

  // Tailored resumes export for free (the AI tailoring already covered the cost).
  const EXPORT_CREDIT_COST = mode === 'scratch' ? pricing.creditCost : 0;

  const handleSave = async ({ skipNavigate = false } = {}) => {
    try {
      setIsSaving(true);
      const payload = {
        title,
        mode,
        data,
        jobDescription,
        atsScore
      };

      let savedResume;
      if (resumeId) {
        savedResume = await resumeApi.update(resumeId, payload);
        toast.success('Resume updated successfully');
      } else {
        savedResume = await resumeApi.create(payload);
        toast.success('Resume saved successfully');
      }
      
      if (onSaveComplete && !skipNavigate) {
        onSaveComplete(savedResume);
      }

      return savedResume;
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save resume');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecalculateScore = async () => {
    try {
      setIsScoring(true);
      const newScore = await resumeApi.score({ resume: data, jobDescription });
      setAtsScore(newScore);
      toast.success('Score recalculated based on your latest edits');
    } catch (err) {
      console.error('Scoring error:', err);
      toast.error('Failed to recalculate score');
    } finally {
      setIsScoring(false);
    }
  };

  // Runs the export against the backend (optionally redeeming a paid order),
  // saves progress, then downloads a PDF from the full-size off-screen preview.
  const runExport = async (paidOrderId) => {
    await resumeApi.export({ mode, paidOrderId });
    await refreshWallet();
    const savedResume = await handleSave({ skipNavigate: true });

    if (!exportRef.current) {
      throw new Error('Resume preview is not ready');
    }

    await downloadResumePdf(exportRef.current, title);
    toast.success('PDF downloaded successfully');

    if (savedResume && onSaveComplete) {
      onSaveComplete(savedResume);
    }
  };

  const handleGenerate = async () => {
    // Tailored resumes are free to export — no paywall.
    if (mode !== 'scratch') {
      try {
        setIsGenerating(true);
        await runExport();
      } catch (err) {
        console.error('Failed to generate resume:', err);
        toast.error(err.message || 'Failed to generate resume. Please try again.');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Scratch resumes open the unified paywall (credits vs a la carte).
    openPaywall({
      actionId: 'resume-export',
      label: 'Export Resume PDF',
      description: 'Download an ATS-friendly PDF of your resume.',
      creditCost: pricing.creditCost,
      cashPrice: pricing.cashPriceInr,
      onPayWithCredits: () => runExport(),
      onPayAlaCarte: (paidOrderId) => runExport(paidOrderId),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resume Title"
          className="font-display text-2xl sm:text-4xl md:text-5xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-black/20 w-full md:w-auto"
        />
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="pill-btn-secondary text-sm flex items-center gap-2"
          >
            {isSaving ? 'SAVING...' : <><Save className="w-4 h-4" /> SAVE</>}
          </button>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="pill-btn text-sm flex items-center gap-2"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                GENERATING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" /> 
                EXPORT PDF {EXPORT_CREDIT_COST > 0 ? `(-${EXPORT_CREDIT_COST} CR)` : '(FREE)'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ATS Score Card - Always show in tailored mode, optional in scratch if we implement a JD toggle */}
      {atsScore && (
        <div className="print:hidden">
          <AtsScoreCard 
            score={atsScore} 
            onRecalculate={handleRecalculateScore} 
            isCalculating={isScoring} 
          />
        </div>
      )}

      {/* Mobile Tab Toggle */}
      <div className="flex xl:hidden gap-3 print:hidden">
        <button
          onClick={() => setMobileTab('edit')}
          className={`${mobileTab === 'edit' ? 'pill-btn bg-black text-white' : 'pill-btn-secondary bg-white text-black'} flex-1 justify-center !px-5 !py-2.5 text-sm`}
        >
          EDIT
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`${mobileTab === 'preview' ? 'pill-btn bg-black text-white' : 'pill-btn-secondary bg-white text-black'} flex-1 justify-center !px-5 !py-2.5 text-sm`}
        >
          PREVIEW
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:block print:w-full">
        {/* Left Side: Form Builder (Hidden when printing) */}
        <div className={`${mobileTab === 'edit' ? 'block' : 'hidden'} xl:block space-y-6 print:hidden pb-12`}>
          <PersonalInfoSection 
            data={data.personalInfo} 
            updateData={(info) => setData({ ...data, personalInfo: info })} 
          />
          <EducationSection 
            items={data.education} 
            updateItems={(items) => setData({ ...data, education: items })} 
          />
          <SkillsSection 
            items={data.skills} 
            updateItems={(items) => setData({ ...data, skills: items })} 
          />
          <ExperienceSection 
            items={data.experience} 
            updateItems={(items) => setData({ ...data, experience: items })} 
          />
          <ProjectsSection 
            items={data.projects} 
            updateItems={(items) => setData({ ...data, projects: items })} 
          />
          <PublicationsSection 
            items={data.publications} 
            updateItems={(items) => setData({ ...data, publications: items })} 
          />
          <AchievementsSection 
            items={data.achievements} 
            updateItems={(items) => setData({ ...data, achievements: items })} 
          />
        </div>

        {/* Right Side: Live Preview (Only this is visible when printing) */}
        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} xl:flex print:flex print:p-0 print:m-0 flex-col`}>
          <div className="bg-black/5 rounded-[32px] p-4 lg:p-8 overflow-hidden print:p-0 print:bg-transparent">
            {/* The actual preview component that gets printed */}
            <div className="transform origin-top flex justify-center print:transform-none">
              <div className="scale-[0.55] xs:scale-[0.65] sm:scale-75 md:scale-90 xl:scale-100 transform origin-top w-[794px]">
                <ResumePreview data={data} ref={printRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-size off-screen copy used for PDF export (html2canvas needs no scale transform) */}
      <div
        aria-hidden="true"
        className="fixed top-0 pointer-events-none"
        style={{ left: '-10000px', width: '8.5in' }}
      >
        <ResumePreview data={data} ref={exportRef} exportSource />
      </div>
    </div>
  );
}
