import React, { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '../../lib/lenisScroll';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'stats', label: 'Impact' },
  { id: 'testimonials', label: 'Stories' },
  { id: 'about', label: 'Why Us' },
  { id: 'faq', label: 'FAQ' }
];

export default function SectionDotNav() {
  const [activeId, setActiveId] = useState('hero');

  useEffect(() => {
    if (window.innerWidth < 1024) return;

    const triggers = [];

    const timer = setTimeout(() => {
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActiveId(id);
          }
        });
        triggers.push(st);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      triggers.forEach(t => t.kill());
    };
  }, []);

  const scrollTo = (id) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: -50, duration: 1.2 });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return null;

  return (
    <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-50 mix-blend-difference text-white">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className="group relative flex items-center justify-end w-8 h-4 focus-visible:outline-none"
          aria-label={`Scroll to ${label}`}
        >
          <span 
            className={`absolute right-8 text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ${
              activeId === id ? 'opacity-100' : ''
            }`}
          >
            {label}
          </span>
          <div 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeId === id ? 'bg-white scale-150' : 'bg-white/50 group-hover:bg-white/80'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
