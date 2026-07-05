import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let isRegistered = false;

export const registerGSAP = () => {
  if (typeof window !== 'undefined' && !isRegistered) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    isRegistered = true;
  }
  return { gsap, ScrollTrigger, SplitText };
};
