import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Plus, Clock, FileCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { resumeApi } from '../../lib/api';

export default function ResumeMakerHomePage() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const data = await resumeApi.list();
      setResumes(data);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <div className="pill-badge bg-black/5 text-black w-fit mb-2">RESUME MAKER</div>
        <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
          Get Past<br />The ATS.
        </h1>
        <p className="text-lg font-medium text-black/60 max-w-xl mt-4">
          Build a perfect resume from scratch, or let our AI tailor your existing resume to a specific job description to maximize your ATS score.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Build from Scratch Card */}
        <motion.div variants={item} className="bento-card p-5 sm:p-8 group cursor-pointer flex flex-col justify-between min-h-[200px] sm:min-h-[280px] md:min-h-[300px]" onClick={() => navigate('/dashboard/resume-maker/build')}>
          <div>
            <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-[24px] bg-black flex items-center justify-center shadow-[var(--shadow-soft)] mb-6 transition-transform group-hover:scale-110">
              <FileText className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase mb-4 text-black">Build From<br/>Scratch</h2>
            <p className="text-black/60 font-medium">Manually fill in your details to generate a clean, ATS-optimized PDF resume. Costs 2 credits per export.</p>
          </div>
          <div className="mt-8 flex items-center text-sm font-bold uppercase tracking-widest text-black group-hover:text-[var(--color-accent-blue)] transition-colors">
            Start Building &rarr;
          </div>
        </motion.div>

        {/* Tailor to Job Card */}
        <motion.div variants={item} className="bento-card p-5 sm:p-8 group cursor-pointer flex flex-col justify-between min-h-[200px] sm:min-h-[280px] md:min-h-[300px]" onClick={() => navigate('/dashboard/resume-maker/tailor')}>
          <div>
            <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-[24px] bg-[var(--color-accent-blue)] flex items-center justify-center shadow-[var(--shadow-soft)] mb-6 transition-transform group-hover:scale-110">
              <Sparkles className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase mb-4 text-black">Tailor To<br/>A Job</h2>
            <p className="text-black/60 font-medium">Upload your resume and paste a JD. Our AI will align your keywords and optimize your content. Costs 4 credits.</p>
          </div>
          <div className="mt-8 flex items-center text-sm font-bold uppercase tracking-widest text-[var(--color-accent-blue)] group-hover:text-black transition-colors">
            Start Tailoring &rarr;
          </div>
        </motion.div>
      </motion.div>

      {/* Saved Resumes Section */}
      <div className="pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl font-bold uppercase">My Resumes</h2>
          <Link to="/dashboard/resume-maker/build" className="pill-badge bg-black/5 text-black hover:bg-black/10 transition-colors py-2 px-4 cursor-pointer">
            <Plus className="w-4 h-4 mr-1" /> New
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="bento-card p-12 text-center border-2 border-dashed border-black/10 bg-transparent shadow-none">
            <FileCheck className="w-12 h-12 text-black/20 mx-auto mb-4" />
            <h3 className="font-bold text-xl uppercase mb-2">No Saved Resumes</h3>
            <p className="text-black/50 font-medium">Create your first resume to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Link 
                key={resume._id} 
                to={`/dashboard/resume-maker/${resume.mode === 'tailored' ? 'tailor' : 'build'}?id=${resume._id}`}
                className="bento-card p-6 group hover:bg-gray-50 transition-colors block border border-black/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`pill-badge ${resume.mode === 'tailored' ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]' : 'bg-black/5 text-black'}`}>
                    {resume.mode === 'tailored' ? 'TAILORED' : 'MANUAL'}
                  </div>
                  {resume.atsScore && (
                    <div className="font-display font-bold text-lg">
                      {resume.atsScore.overall}<span className="text-xs text-black/40">/100</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg truncate mb-2">{resume.title || 'Untitled Resume'}</h3>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-black/40">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
