import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useCountUp(endValue, { duration = 2, delay = 0, suffix = "", prefix = "" } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Custom formatting for floats like 3.2
    const isFloat = endValue % 1 !== 0;
    
    const formatValue = (val) => {
      let numStr = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString();
      return `${prefix}${numStr}${suffix}`;
    };

    if (prefersReducedMotion) {
      el.textContent = formatValue(endValue);
      return;
    }

    const obj = { val: 0 };
    let tween;
    
    // Defer creation to avoid miscalculating position during initial render (e.g. splash screens)
    const timer = setTimeout(() => {
      tween = gsap.to(obj, {
        val: endValue,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        },
        onUpdate: () => {
          el.textContent = formatValue(obj.val);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (tween) tween.kill();
    };
  }, [endValue, duration, delay, suffix, prefix]);

  return ref;
}
