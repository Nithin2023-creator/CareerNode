import React from 'react';
import { PIPELINE_STATUS } from '../../pages/job-finder/helpers';
import { Search, ListFilter, BrainCircuit, Mail, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 'crawl', label: 'Crawl', statusKeys: [PIPELINE_STATUS.CRAWLING], icon: Search },
  { id: 'extract', label: 'Extract', statusKeys: [PIPELINE_STATUS.EXTRACTING], icon: ListFilter },
  { id: 'match', label: 'AI Match', statusKeys: [PIPELINE_STATUS.MATCHING], icon: BrainCircuit },
  { id: 'mail', label: 'Report', statusKeys: [PIPELINE_STATUS.EMAILING], icon: Mail },
  { id: 'done', label: 'Done', statusKeys: [PIPELINE_STATUS.COMPLETED], icon: CheckCircle2 }
];

export default function ProgressPipeline({ status }) {
  // Determine current step index based on status
  let currentStepIndex = -1;
  
  if (status === PIPELINE_STATUS.QUEUED) {
    currentStepIndex = 0; // hasn't started first step yet, but conceptually on it
  } else if (status === PIPELINE_STATUS.COMPLETED) {
    currentStepIndex = steps.length - 1;
  } else if (status === PIPELINE_STATUS.FAILED) {
    currentStepIndex = -1; // special case, maybe highlight red
  } else {
    currentStepIndex = steps.findIndex(s => s.statusKeys.includes(status));
  }

  return (
    <div className="w-full overflow-x-auto pb-2 hide-scrollbar md:overflow-visible">
      <div className="min-w-[520px] md:min-w-0 flex items-center justify-between relative">
      {/* Background track line */}
      <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-black/5 z-0" />
      
      {/* Active track line */}
      {currentStepIndex > 0 && (
        <div 
          className="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 bg-[var(--color-accent-blue)]/50 z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 80}%` }}
        />
      )}

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStepIndex && status !== PIPELINE_STATUS.COMPLETED;
        const isPast = index < currentStepIndex || status === PIPELINE_STATUS.COMPLETED;
        
        let circleClass = 'bg-white border-2 border-black/10 text-black/30';
        let iconClass = 'text-black/30';
        let textClass = 'text-black/40';

        if (isPast) {
          circleClass = 'bg-[var(--color-accent-blue)]/10 border-transparent text-[var(--color-accent-blue)]';
          iconClass = 'text-[var(--color-accent-blue)]';
          textClass = 'text-black font-bold';
        } else if (isActive) {
          circleClass = 'bg-[var(--color-accent-blue)] border-transparent text-white shadow-[var(--shadow-soft)]';
          iconClass = 'text-white';
          textClass = 'text-[var(--color-accent-blue)] font-bold';
        }

        if (status === PIPELINE_STATUS.FAILED && isActive) {
          circleClass = 'bg-red-500 border-transparent text-white';
          iconClass = 'text-white';
          textClass = 'text-red-600 font-bold';
        }

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass}`}>
              <Icon className={`h-5 w-5 ${iconClass}`} />
              {isActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === PIPELINE_STATUS.FAILED ? 'bg-red-400' : 'bg-[var(--color-accent-blue)]'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${status === PIPELINE_STATUS.FAILED ? 'bg-red-500' : 'bg-[var(--color-accent-blue)]'}`}></span>
                </span>
              )}
            </div>
            <span className={`text-xs uppercase tracking-widest text-center ${textClass}`}>
              {step.label}
            </span>
          </div>
        );
      })}
      </div>
    </div>
  );
}
