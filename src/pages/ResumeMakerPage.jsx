import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Sparkles, Download, CheckSquare } from 'lucide-react';

export default function ResumeMakerPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pill-badge bg-black/5 text-black mb-4">AI TAILOR</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
            Resume Maker.
          </h1>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Inputs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="space-y-6"
        >
          <div className="bento-card p-6 md:p-8 bg-white/50 backdrop-blur-sm">
            <h3 className="font-display text-3xl font-bold uppercase mb-6 flex items-center gap-3">
              1. Base Resume
            </h3>
            <div className="border-2 border-dashed border-black/20 rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-white hover:bg-[var(--color-accent-blue)]/5 hover:border-[var(--color-accent-blue)] group">
              <Upload className="h-10 w-10 text-black/50 mb-4 group-hover:text-[var(--color-accent-blue)]" />
              <p className="text-xl font-display font-bold mb-2 group-hover:text-[var(--color-accent-blue)] uppercase text-black">Upload or Drop</p>
              <div className="pill-badge bg-black/5 text-black group-hover:bg-[var(--color-accent-blue)]/10 group-hover:text-[var(--color-accent-blue)] border-transparent">PDF OR DOCX</div>
            </div>
            
            {/* Mock uploaded state */}
            <div className="mt-6 flex items-center gap-4 p-4 bg-white shadow-[var(--shadow-soft)] rounded-[32px] border border-black/5">
              <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-lg font-bold uppercase truncate">base_resume.pdf</p>
                <div className="pill-badge mt-1 bg-black/5 text-black">1.2 MB</div>
              </div>
              <CheckSquare className="h-6 w-6 text-[var(--color-accent-blue)] flex-shrink-0" />
            </div>
          </div>

          <div className="bento-card p-6 md:p-8 bg-white/50 backdrop-blur-sm">
            <h3 className="font-display text-3xl font-bold uppercase mb-6">2. Job Description</h3>
            <textarea 
              className="w-full h-48 bg-white/80 border border-black/10 shadow-inner rounded-[32px] p-6 text-lg font-body font-medium text-black focus:outline-none focus:ring-4 focus:ring-black/5 transition-shadow resize-none leading-relaxed placeholder:text-black/30"
              placeholder="Paste the job description here..."
            ></textarea>
            
            <button className="w-full pill-btn mt-8 text-lg flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" /> TAILOR RESUME
            </button>
          </div>
        </motion.div>

        {/* Right Side: Output Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.1 }}
          className="bento-card p-6 md:p-8 flex flex-col items-center justify-center min-h-[600px] text-center relative overflow-hidden group bg-white text-black"
        >
          <FileText className="h-32 w-32 text-black/10 mb-8 z-10 transition-transform group-hover:scale-110 duration-500" />
          <h3 className="font-display text-3xl font-bold uppercase z-10 mb-4">Ready to Tailor</h3>
          <p className="text-lg font-medium text-black/60 max-w-sm z-10">Your perfectly matched ATS-friendly resume will appear right here.</p>
          
          <div className="absolute bottom-8 z-20 flex gap-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 duration-300">
            <button className="pill-btn-secondary text-black">
               PREVIEW
            </button>
            <button className="pill-btn bg-black text-white hover:bg-white hover:text-black flex items-center gap-2">
              <Download className="h-5 w-5" /> DOWNLOAD PDF
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
