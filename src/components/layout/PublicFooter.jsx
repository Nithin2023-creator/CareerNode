import React from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Link as LinkIcon, X } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-black text-white pt-24 pb-12 px-4 md:px-8 z-20 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8 mb-20">
          
          <div className="col-span-1 md:col-span-2 pr-0 md:pr-8">
            <Link to="/" className="flex items-center gap-1 group mb-6 w-fit">
              <span className="font-display font-bold text-2xl tracking-tight text-white leading-none uppercase">
                Career
              </span>
              <span className="font-display font-bold text-2xl tracking-tight text-black bg-white px-1.5 rounded-xl leading-none uppercase pt-0.5">
                Node.
              </span>
            </Link>
            <p className="text-white/60 font-medium text-sm leading-relaxed max-w-xs">
              The automated job-hunting platform for freshers. Stop applying manually, start hacking your career.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-sm mb-6 text-white/50">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/dashboard/job-finder" className="text-white/80 hover:text-white font-medium transition-colors">Job Finder</Link></li>
              <li><Link to="/dashboard/emailer" className="text-white/80 hover:text-white font-medium transition-colors">Cold Mailer</Link></li>
              <li><Link to="/dashboard/resume-maker" className="text-white/80 hover:text-white font-medium transition-colors">Resume Maker</Link></li>
              <li><Link to="/dashboard/automations" className="text-white/80 hover:text-white font-medium transition-colors">Automations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-sm mb-6 text-white/50">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/#about" className="text-white/80 hover:text-white font-medium transition-colors">About Us</Link></li>
              <li><Link to="/#faq" className="text-white/80 hover:text-white font-medium transition-colors">FAQ</Link></li>
              <li><a href="mailto:support@careernode.com" className="text-white/80 hover:text-white font-medium transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-sm mb-6 text-white/50">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/#faq" className="text-white/80 hover:text-white font-medium transition-colors">Privacy Policy</Link></li>
              <li><Link to="/#faq" className="text-white/80 hover:text-white font-medium transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
          <p className="text-white/40 font-medium text-sm">
            © {new Date().getFullYear()} CareerNode. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/40 hover:text-white transition-colors">
              <AtSign className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/40 hover:text-white transition-colors">
              <LinkIcon className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
