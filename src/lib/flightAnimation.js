import { gsap } from 'gsap';

/**
 * Flies an element from its current on-screen position to match the size and position of a target element.
 * 
 * @param {HTMLElement} outerEl - The container element to move and scale.
 * @param {HTMLElement} innerEl - The inner element to rotate (avoids transform conflicts).
 * @param {HTMLElement} targetEl - The destination element to match.
 * @param {Object} options - Configuration for duration, spins, and easing.
 * @returns {gsap.core.Timeline} A GSAP timeline that can be chained.
 */
export function flyTo(outerEl, innerEl, targetEl, { duration = 1, spins = 1, ease = 'power3.inOut' } = {}) {
  const tl = gsap.timeline();
  
  if (!outerEl || !targetEl) {
    console.warn("flyTo: Missing outerEl or targetEl", { outerEl, targetEl });
    return tl; // Empty timeline allows graceful degradation
  }

  const outerRect = outerEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  // If target isn't visible/rendered, fallback to current position/scale to avoid NaN errors
  if (targetRect.width === 0 || targetRect.height === 0 || outerRect.width === 0) {
    console.warn("flyTo: Target or outer element has 0 size, skipping flight.");
    return tl;
  }

  const outerCenterX = outerRect.left + outerRect.width / 2;
  const outerCenterY = outerRect.top + outerRect.height / 2;

  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  const dx = targetCenterX - outerCenterX;
  const dy = targetCenterY - outerCenterY;

  // Calculate new scale relative to GSAP's current tracked scale
  const currentScale = gsap.getProperty(outerEl, "scaleX") || 1;
  const ratio = targetRect.width / outerRect.width;
  const newScale = currentScale * ratio;

  tl.to(outerEl, {
    x: `+=${dx}`,
    y: `+=${dy}`,
    scale: newScale,
    duration,
    ease
  }, 0);

  if (innerEl && spins > 0) {
    tl.to(innerEl, {
      rotation: `+=${spins * 360}`,
      duration,
      ease
    }, 0);
  }

  return tl;
}
