import Lenis from 'lenis';
import { gsap } from 'gsap';
import { registerGSAP } from './gsap';

let lenisInstance = null;

export function getLenis() {
  return lenisInstance;
}

export function initLenisScroll() {
  const { ScrollTrigger } = registerGSAP();

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenisInstance = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  const onRefresh = () => lenis.resize();
  ScrollTrigger.addEventListener('refresh', onRefresh);

  const update = (time) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(update);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(update);
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    ScrollTrigger.scrollerProxy(document.documentElement, {});
    lenis.destroy();
    lenisInstance = null;
  };
}

export function refreshScrollTrigger() {
  const { ScrollTrigger } = registerGSAP();
  ScrollTrigger.refresh();
}
