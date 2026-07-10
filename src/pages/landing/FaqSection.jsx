import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is CareerNode?",
      a: "CareerNode is an automated platform designed specifically for freshers. It combines a job scraper, cold outreach engine, and ATS resume builder into a single seamless experience."
    },
    {
      q: "Is it free to start?",
      a: "Yes! You can sign up, build your profile, and use the base features completely free. You also get 50 free credits just for signing up to explore our premium tools. Advanced features operate on a transparent credit system."
    },
    {
      q: "What are credits?",
      a: "Credits are our ecosystem currency. You can use them to purchase verified HR email bundles or unlock premium AI scans. You buy what you need, with no hidden fees."
    },
    {
      q: "Do I need an existing resume?",
      a: "Yes, you upload your standard 'base' resume. Our AI ATS Tailor then uses that base to generate customized versions perfectly matched to each specific job description you apply for."
    },
    {
      q: "Is my data safe?",
      a: "Absolutely. We don't sell your data to third parties. Your resume, profile details, and campaign metrics are encrypted and private."
    },
    {
      q: "Can I cancel a subscription anytime?",
      a: "Yes. Our Job Finder auto-scanning tool has 30-day subscriptions that you can pause or cancel at any time directly from your dashboard with one click."
    }
  ];

  return (
    <section id="faq" className="faq-section scroll-mt-28 py-24 px-4 md:px-8 max-w-4xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="pill-badge bg-black/5 text-black mb-4 inline-block">GOT QUESTIONS?</div>
        <h2 className="font-display text-fluid-h2 font-bold uppercase mb-4">FAQ.</h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="faq-item bento-card bg-white border border-black/10 overflow-hidden transition-all shadow-sm hover:shadow-[var(--shadow-soft)]"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
            >
              <h3 className="font-display text-xl md:text-2xl font-bold uppercase pr-8 text-black">
                {faq.q}
              </h3>
              <div className={`h-10 w-10 shrink-0 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[2000px] opacity-100 pb-6 md:pb-8 px-6 md:px-8' : 'max-h-0 opacity-0 px-6 md:px-8 overflow-hidden'}`}
            >
              <div className="w-full h-[1px] bg-black/5 mb-6" />
              <p className="text-black/70 font-medium leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
