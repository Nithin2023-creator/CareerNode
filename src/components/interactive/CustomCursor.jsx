import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { isSplashSkipped, onSplashVisibleChange } from '../../lib/splashState';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const isVisibleRef = useRef(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [splashActive, setSplashActive] = useState(() => !isSplashSkipped());

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const disabled = isTouch || prefersReducedMotion || splashActive;

  useEffect(() => onSplashVisibleChange(setSplashActive), []);

  useEffect(() => {
    if (disabled) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3' });

    const onMouseMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target;
      const isInteractive =
        target.closest('[data-cursor="hover"]') ||
        target.closest('a') ||
        target.closest('button');

      setIsHovering(!!isInteractive);
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;

    const style = document.createElement('style');
    style.innerHTML = `
      body, a, button, [data-cursor="hover"] {
        cursor: none !important;
      }
      input, textarea {
        cursor: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 w-4 h-4 pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="w-full h-full bg-white rounded-full transition-transform duration-300 ease-out"
        style={{
          transform: isHovering ? 'scale(3)' : 'scale(1)',
        }}
      />
    </div>
  );
}
