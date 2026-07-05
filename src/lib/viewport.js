export const MOBILE_LG_MEDIA = '(max-width: 1023px)';

export function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_LG_MEDIA).matches;
}

export function isCoarsePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}
