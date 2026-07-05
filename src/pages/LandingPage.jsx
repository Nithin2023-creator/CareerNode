import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { registerGSAP } from '../lib/gsap';
import { refreshScrollTrigger } from '../lib/lenisScroll';
import { isSplashSkipped, SPLASH_COMPLETE_EVENT } from '../lib/splashState';

import HeroSection from './landing/HeroSection';
import TrustStrip from './landing/TrustStrip';
import HowItWorks from './landing/HowItWorks';
import ToolkitShowcase from './landing/ToolkitShowcase';
import FeatureMarquee from './landing/FeatureMarquee';
import AutomationsTeaser from './landing/AutomationsTeaser';
import StatsBand from './landing/StatsBand';
import TestimonialsSection from './landing/TestimonialsSection';
import BrandPillars from './landing/BrandPillars';
import BigCta from './landing/BigCta';
import FaqSection from './landing/FaqSection';
import GridBrandSection from './landing/GridBrandSection';

function revealOnScroll(selector, stagger = 0.12) {
  const { ScrollTrigger } = registerGSAP();

  ScrollTrigger.batch(selector, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, stagger, ease: 'power3.out', overwrite: true }
      );
    },
  });
}

export default function LandingPage() {
  const container = useRef();
  const refreshTimerRef = useRef(null);
  const startHeroIntroRef = useRef(null);

  useEffect(() => {
    const { SplitText, ScrollTrigger } = registerGSAP();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      let intro;

      if (prefersReducedMotion) {
        gsap.set(['.hero-headline', '.hero-subtext', '.hero-cta', '.parallax-badge-1', '.parallax-badge-2', '.parallax-badge-3', '.hero-marquee'], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
      } else {
        gsap.set('.hero-headline', { autoAlpha: 1 });
        const split = new SplitText('.hero-headline', { type: 'lines,words' });
        gsap.set(split.lines, { autoAlpha: 0, y: 48 });
        gsap.set(['.hero-subtext', '.hero-cta'], { autoAlpha: 0, y: 28 });
        gsap.set(['.parallax-badge-1', '.parallax-badge-2', '.parallax-badge-3'], { autoAlpha: 0, y: 24 });
        gsap.set('.hero-marquee', { autoAlpha: 0, y: 16 });

        intro = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true });

        intro
          .to(split.lines, {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.06,
          }, 0.15)
          .to('.hero-subtext', {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
          }, 0.45)
          .to('.hero-cta', {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
          }, 0.6)
          .to(['.parallax-badge-1', '.parallax-badge-2', '.parallax-badge-3'], {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
          }, 0.35)
          .to('.hero-marquee', {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
          }, 0.75);
      }

      startHeroIntroRef.current = () => {
        if (intro) intro.play();
        refreshTimerRef.current = setTimeout(
          () => refreshScrollTrigger(),
          prefersReducedMotion ? 100 : 1400
        );
      };

      if (isSplashSkipped()) {
        startHeroIntroRef.current();
      } else {
        window.addEventListener(SPLASH_COMPLETE_EVENT, startHeroIntroRef.current, { once: true });
      }

      const parallaxMm = gsap.matchMedia();
      parallaxMm.add('(min-width: 1024px)', () => {
        gsap.to('.parallax-badge-1', {
          y: -150,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
        gsap.to('.parallax-badge-2', {
          y: 150,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
        gsap.to('.parallax-badge-3', {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });

      revealOnScroll('.toolkit-card', 0.2);
      revealOnScroll('.how-it-works-step', 0.12);
      revealOnScroll('.stats-item', 0.1);
      revealOnScroll('.brand-pillar', 0.15);
      revealOnScroll('.faq-item', 0.08);
      revealOnScroll('.trust-badge', 0.08);
      revealOnScroll('.grid-pixel', 0.06);

      ScrollTrigger.batch('.automations-teaser', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', overwrite: true }
          );
        },
      });
    }, container);

    return () => {
      clearTimeout(refreshTimerRef.current);
      if (startHeroIntroRef.current) {
        window.removeEventListener(SPLASH_COMPLETE_EVENT, startHeroIntroRef.current);
      }
      ctx.revert();
    };
  }, []);

  return (
    <div ref={container} className="w-full relative bg-[var(--color-background)] overflow-x-hidden">
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <ToolkitShowcase />
      <FeatureMarquee />
      <AutomationsTeaser />
      <StatsBand />
      <TestimonialsSection />
      <BrandPillars />
      <BigCta />
      <FaqSection />
      <GridBrandSection />
    </div>
  );
}
