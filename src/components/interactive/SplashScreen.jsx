import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { dispatchSplashComplete, isSplashSkipped, setSplashVisible } from '../../lib/splashState';
import HouseIcon from './HouseIcon';
import { flyTo } from '../../lib/flightAnimation';

const GRID_CELL = 48;

const pixels = [
  { col: 2, row: 2, color: 'var(--color-accent-blue)' },
  { col: 4, row: 7, color: '#e63946' },
  { col: 11, row: 3, color: '#ff6b35' },
  { col: 17, row: 1, color: '#7b2cbf' },
  { col: 20, row: 4, color: 'var(--color-accent-yellow)' },
  { col: 23, row: 6, color: '#2a9d8f' },
];

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(() => !isSplashSkipped());

  const containerRef = useRef(null);
  const pixelsRef = useRef(null);
  const bigOuterRef = useRef(null);
  const bigInnerRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    setSplashVisible(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.documentElement.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      gsap.set(bigOuterRef.current, { xPercent: -50, yPercent: -50 });

      if (prefersReducedMotion) {
        gsap.set(containerRef.current, { opacity: 1 });
      } else {
        // Entrance animation
        tl.from(bigOuterRef.current, { scale: 0, duration: 1, ease: 'power3.out' }, 0)
          .from(bigInnerRef.current, { rotation: -120, duration: 1, ease: 'back.out(2)' }, 0)
          .from(pixelsRef.current.children, { scale: 0, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.5)' }, 0.2);
      }

      const fontReady = document.fonts ? document.fonts.ready : Promise.resolve();
      // Increase delay slightly so the entrance spin is visible before flying away
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));

      Promise.all([fontReady, minDelay]).then(() => {
        const cleanup = () => {
          sessionStorage.setItem('cn_splash_seen', '1');
          document.documentElement.style.overflow = '';
          setSplashVisible(false);
          dispatchSplashComplete();
          setIsVisible(false);
        };

        if (prefersReducedMotion) {
          const navTarget = document.querySelector('[data-splash-nav-target]');
          if (navTarget) gsap.set(navTarget, { opacity: 1 });
          gsap.to(containerRef.current, { opacity: 0, duration: 0.5, onComplete: cleanup });
          return;
        }

        const navTarget = document.querySelector('[data-splash-nav-target]');
        
        // Single Stage: Fly directly to nav logo and wipe container
        const exitTl = gsap.timeline({
          onComplete: () => {
            if (navTarget) gsap.set(navTarget, { opacity: 1 });
            gsap.set(bigOuterRef.current, { opacity: 0 }); // Hide flying element
            cleanup();
          }
        });

        if (navTarget) {
          exitTl.add(flyTo(bigOuterRef.current, bigInnerRef.current, navTarget, { duration: 0.9, spins: 3, ease: 'power3.inOut' }), 0);
        } else {
          // Defensive: if no target, just fade out pentagon
          exitTl.to(bigOuterRef.current, { opacity: 0, duration: 0.3 }, 0);
        }

        exitTl.to(pixelsRef.current.children, { scale: 0, opacity: 0, stagger: 0.05, duration: 0.3, ease: 'power2.in' }, 0);
        exitTl.to(containerRef.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 0);
      });
    }, containerRef);

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = '';
      setSplashVisible(false);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 z-[10001] bg-[var(--color-background)] flex flex-col items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 grid-brand-bg opacity-40 pointer-events-none" aria-hidden="true" />
        
        <div ref={pixelsRef} className="absolute inset-0 pointer-events-none opacity-50 max-w-7xl mx-auto hidden md:block">
          {pixels.map((pixel, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${(pixel.col / 24) * 100}%`,
                top: `${(pixel.row / 8) * 100}%`,
                width: GRID_CELL,
                height: GRID_CELL,
                backgroundColor: pixel.color,
              }}
            />
          ))}
        </div>
      </div>

      {/* Flying Big Pentagon */}
      <div 
        ref={bigOuterRef} 
        className="fixed top-1/2 left-1/2 pointer-events-none z-[10002] text-black"
        style={{ width: 'clamp(160px, 26vw, 300px)', height: 'clamp(160px, 26vw, 300px)' }}
      >
        <HouseIcon ref={bigInnerRef} className="w-full h-full" />
      </div>
    </>
  );
}
