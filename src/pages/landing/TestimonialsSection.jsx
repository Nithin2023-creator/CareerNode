import React, { useState, useEffect, useCallback } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Landed 3 interviews in my first week using the auto-scanner. It completely changed how I approach my daily search.",
    author: "Sarah J.",
    role: "Recent Graduate",
    rating: 5
  },
  {
    quote: "The personalized cold emails have a 40% higher open rate than my generic templates. Worth every single credit.",
    author: "Michael T.",
    role: "Software Engineer",
    rating: 5
  },
  {
    quote: "Resume Maker instantly tailored my old PDF to match a Product Manager role. Passed the ATS on my first try.",
    author: "Elena R.",
    role: "Product Manager",
    rating: 5
  },
  {
    quote: "I literally run the background automation while I sleep. Waking up to fresh HR contacts is a game changer.",
    author: "David K.",
    role: "Junior Designer",
    rating: 5
  }
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  }, []);

  const prev = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  return (
    <section id="testimonials" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20 overflow-hidden">
      <div className="text-center mb-16">
        <div className="pill-badge bg-[var(--color-accent-blue)] text-white mb-4 inline-block">SUCCESS STORIES</div>
        <h2 className="font-display text-fluid-h2 font-bold uppercase mb-4">Don't just take our word for it.</h2>
      </div>

      <div 
        className="relative max-w-4xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        data-cursor="hover"
      >
        <div className="overflow-hidden relative rounded-[32px] p-2">
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonials.map((t, i) => (
              <div key={i} className="w-full shrink-0 px-4">
                <div className="bento-card bg-white p-8 md:p-12 shadow-[var(--shadow-soft)] border border-black/10 flex flex-col items-center text-center">
                  <div className="flex gap-1 mb-6 text-[var(--color-accent-yellow)]">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="h-6 w-6 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-10 w-10 text-black/10 mb-6" />
                  <p className="font-display text-2xl md:text-3xl font-medium leading-tight mb-8">
                    "{t.quote}"
                  </p>
                  <div>
                    <div className="font-bold uppercase tracking-widest">{t.author}</div>
                    <div className="text-black/50 text-sm font-medium mt-1">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button 
            onClick={prev}
            className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <div className="flex gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'bg-black scale-125' : 'bg-black/20 hover:bg-black/40'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={next}
            className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
