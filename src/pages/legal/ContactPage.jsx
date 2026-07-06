import React from 'react';
import { Mail, Clock, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6">
        Contact Us
      </h1>
      <p className="text-xl md:text-2xl text-black/60 font-medium mb-12">
        Have questions about CareerNode? We're here to help. Reach out to our team using the details below.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {/* Email Card */}
        <div className="bento-card bg-[var(--color-accent-yellow)] p-8 border-2 border-black shadow-[var(--shadow-solid)] hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)] transition-all flex flex-col items-start">
          <Mail className="h-10 w-10 mb-6 text-black" />
          <h2 className="font-display text-2xl font-bold uppercase mb-2">Email Support</h2>
          <p className="text-black/80 font-medium mb-6 max-w-lg">
            For general inquiries, billing, and technical support. We aim to respond within 24 hours.
          </p>
          <a href="mailto:nithinchowdary565@gmail.com" className="inline-block bg-black text-white font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:bg-black/80 transition-colors">
            nithinchowdary565@gmail.com
          </a>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card bg-black/5 p-6 border border-black/10 flex items-start gap-4">
          <Clock className="h-6 w-6 text-black mt-1" />
          <div>
            <h3 className="font-bold uppercase tracking-widest mb-1">Business Hours</h3>
            <p className="text-black/60 font-medium">Monday - Friday<br/>9:00 AM - 6:00 PM (EST)</p>
          </div>
        </div>

        <div className="bento-card bg-black/5 p-6 border border-black/10 flex items-start gap-4">
          <MapPin className="h-6 w-6 text-black mt-1" />
          <div>
            <h3 className="font-bold uppercase tracking-widest mb-1">Headquarters</h3>
            <p className="text-black/60 font-medium">123 CareerNode Blvd, Suite 400<br/>San Francisco, CA 94105</p>
          </div>
        </div>
      </div>
    </div>
  );
}
