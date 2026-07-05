import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, ChevronDown } from 'lucide-react';
import { getMatchTierColor } from '../../pages/job-finder/helpers';

export default function JobCard({ job, onToggleBookmark, compact = false }) {
  const [expanded, setExpanded] = useState(false);

  // If compact is true, we display a denser version of the card
  return (
    <div className={`bg-white/50 backdrop-blur-sm border border-black/5 rounded-[32px] hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] transition-all flex flex-col ${compact ? 'p-5' : 'p-6 md:p-8'}`}>
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className={`pill-badge ${getMatchTierColor(job.matchTier)}`}>
              {job.matchTier.replace('_', ' ').toUpperCase()} {job.matchScore ? `• ${job.matchScore}%` : ''}
            </span>
          </div>
          <h4 className="font-display text-2xl font-bold leading-tight text-black mb-1">
            {job.title}
          </h4>
          <p className="text-sm font-bold uppercase tracking-wide text-black/60">
            {job.company} {job.location && `• ${job.location}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleBookmark) onToggleBookmark(job.id);
            }}
            className={`h-12 w-12 rounded-full border border-black/10 flex items-center justify-center transition-colors ${job.isBookmarked ? 'bg-[var(--color-accent-yellow)]/20 text-[var(--color-accent-yellow)] border-[var(--color-accent-yellow)]/30' : 'bg-white text-black/40 hover:bg-black/5 hover:text-black'}`}
          >
            <Star className="h-5 w-5" fill={job.isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <a 
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 w-12 rounded-full border border-black/10 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.employmentType && (
          <span className="pill-badge bg-black/5 text-black">{job.employmentType}</span>
        )}
        {job.experienceLevel && (
          <span className="pill-badge bg-black/5 text-black">{job.experienceLevel}</span>
        )}
      </div>

      {job.description && (
        <div className="mt-auto border-t border-black/5 pt-4">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full flex justify-between items-center text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors py-2"
          >
            <span>{expanded ? 'Hide Description' : 'Read Description'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 text-black/80 font-medium leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
