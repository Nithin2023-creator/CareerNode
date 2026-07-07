import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function AtsScoreCard({ score, onRecalculate, isCalculating }) {
  if (!score) return null;

  const { overall, breakdown, matchedKeywords, missingKeywords, suggestions } = score;

  // Determine color based on score
  let scoreColor = 'text-red-500';
  if (overall >= 80) {
    scoreColor = 'text-green-500';
  } else if (overall >= 60) {
    scoreColor = 'text-yellow-500';
  }

  return (
    <div className="bento-card bg-white p-6 md:p-8 mb-6 border border-black/5 shadow-[var(--shadow-soft)]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-display font-bold text-3xl uppercase tracking-tight">ATS Score</h2>
          <p className="text-sm font-medium text-black/60">How well your resume matches ATS algorithms</p>
        </div>
        <button 
          onClick={onRecalculate}
          disabled={isCalculating}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Calculating...' : 'Recalculate (Free)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Score Gauge */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-black/5" />
              <motion.circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="10" 
                strokeDasharray={`${(overall / 100) * 283} 283`}
                className={scoreColor}
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${(overall / 100) * 283} 283` }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <div className="font-display font-bold text-5xl leading-none">{overall}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-black/40 mt-1">/ 100</div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
              <span>Keyword Match</span>
              <span>{breakdown.keywords}/40</span>
            </div>
            <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent-blue)] rounded-full" style={{ width: `${(breakdown.keywords / 40) * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
              <span>Completeness</span>
              <span>{breakdown.completeness}/30</span>
            </div>
            <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent-blue)] rounded-full" style={{ width: `${(breakdown.completeness / 30) * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
              <span>Action Verbs</span>
              <span>{breakdown.actionVerbs}/20</span>
            </div>
            <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent-blue)] rounded-full" style={{ width: `${(breakdown.actionVerbs / 20) * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
              <span>Formatting</span>
              <span>{breakdown.formatting}/10</span>
            </div>
            <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent-blue)] rounded-full" style={{ width: `${(breakdown.formatting / 10) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-black/5">
        {/* Keywords */}
        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs text-black/60 mb-4">Keywords Analysis</h3>
          <div className="space-y-4">
            {matchedKeywords && matchedKeywords.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Matched
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedKeywords.map((kw, i) => (
                    <span key={i} className="pill-badge bg-green-50 text-green-700 border border-green-200">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            
            {missingKeywords && missingKeywords.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-bold">
                  <XCircle className="w-4 h-4 text-red-500" /> Missing (Try adding these)
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw, i) => (
                    <span key={i} className="pill-badge bg-red-50 text-red-700 border border-red-200">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs text-black/60 mb-4">Suggestions for improvement</h3>
          {suggestions && suggestions.length > 0 ? (
            <ul className="space-y-3">
              {suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium bg-black/5 p-3 rounded-xl border border-black/5">
                  <AlertCircle className="w-4 h-4 text-[var(--color-accent-blue)] flex-shrink-0 mt-0.5" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Perfect! We don't have any major suggestions for improvement.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
