---
name: Splash pentagon rotate-shrink-land animation
overview: Upgrade the splash screen so the HouseIcon mark (a pentagon silhouette) starts large and centered, spins in, then on exit shrinks/rotates in two legs — first landing at the bottom-right of the "career node" title (matching the units.gr reference), then continuing to fly up and land permanently in the top nav logo as the splash wipes away, handing off into the real header.
todos:
  - id: nav-target
    content: Add small HouseIcon + data-splash-nav-target to PublicLayout nav logo, with lazy initial opacity based on isSplashSkipped()
    status: pending
  - id: flight-helper
    content: Create src/lib/flightAnimation.js with flyTo(outerEl, innerEl, targetEl, opts) using rect-diff translate/scale + separate rotation tween
    status: pending
  - id: big-pentagon
    content: Add big centered HouseIcon layer (outer/inner refs) to SplashScreen with scale-in + spin-in entrance
    status: pending
  - id: stage1-flight
    content: Wire Stage 1 flyTo from big pentagon to the h1 icon-slot ref, concurrent with existing text/progress exit tween
    status: pending
  - id: stage2-flight
    content: Wire Stage 2 flyTo from title slot to nav data-splash-nav-target, concurrent with panel wipe-up; handle missing target defensively
    status: pending
  - id: handoff-cleanup
    content: On Stage 2 complete, hide flying pentagon, set real nav icon opacity to 1, then run existing completion cleanup (sessionStorage, dispatchSplashComplete, setIsVisible)
    status: pending
  - id: reduced-motion
    content: Ensure prefers-reduced-motion path skips pentagon/spin entirely and just sets nav icon opacity 1 directly
    status: pending
  - id: verify
    content: Clear cn_splash_seen in sessionStorage, manually verify animation timing/landing accuracy at desktop + mobile widths, run npm run build
    status: pending
isProject: false
---

## Goal

Recreate the units.gr-style preloader beat: a big pentagon shape rotates, shrinks, and "lands" — but tuned to this brand:

1. **Entrance**: a large `HouseIcon` (already a pentagon/house silhouette) scales in at screen center with a spin, while the `career node` wordmark and progress bar animate as today.
2. **Stage 1 landing**: as the intro wraps up, the big pentagon shrinks + spins (multiple full rotations, easing out) and flies to the exact spot beside the wordmark where the small icon currently sits (`career node` + icon) — this is the dramatic "lands at bottom-right of the title" moment the user pointed to.
3. **Stage 2 handoff**: as the splash panel wipes up/away, the same pentagon continues its journey (no fade/reset) further up to the real top-nav logo position, landing there just as the page is revealed — so the shape becomes the permanent nav-logo icon (currently the nav logo is text-only: `Career` `Node.`).

Reduced-motion and returning-visitor (splash-skipped) paths skip all of this — the nav icon simply renders at full opacity, no animation.

## Files to change

### 1. `src/components/layout/PublicLayout.jsx` — add a landing target
Add a small `HouseIcon` after the `Node.` badge in the nav logo, marked with `data-splash-nav-target` so the splash can measure it:

```9:34:src/components/layout/PublicLayout.jsx
<Link to="/" className="... flex items-center gap-1 group ...">
  <span className="... uppercase">Career</span>
  <span className="... bg-black ... uppercase pt-0.5">Node.</span>
  <HouseIcon
    data-splash-nav-target
    className="w-4 h-4 md:w-5 md:h-5 shrink-0"
    style={{ opacity: isSplashSkipped() ? 1 : 0 }}
  />
</Link>
```
- Initial opacity computed lazily (same `isSplashSkipped()` check `SplashScreen` already uses) so returning visitors see it immediately with no flash, first-time visitors see it invisible until Stage 2 lands.

### 2. `src/lib/flightAnimation.js` (new) — shared fly-to-target helper
Small utility reused for both flight legs, following the existing "outer = position/scale, inner = rotation" split already used in `ToolkitShowcase.jsx`:

```js
export function flyTo(outerEl, innerEl, targetEl, { duration, spins, ease }) { ... }
```
- Reads `outerEl.getBoundingClientRect()` and `targetEl.getBoundingClientRect()`, computes center-to-center delta + scale ratio.
- `gsap.to(outerEl, { x: '+=dx', y: '+=dy', scale: ratio, duration, ease })` for position/size.
- `gsap.to(innerEl, { rotation: '+=' + spins*360, duration, ease })` for spin, on a separate inner node so it doesn't fight the outer transform (same pattern as the tilt/transform split noted in `ToolkitShowcase`).
- Returns the gsap timeline/tween so callers can chain `.then`/`onComplete`.

### 3. `src/components/interactive/SplashScreen.jsx` — rework animation sequence
- Add a big pentagon layer: outer `<div>` fixed at screen center (`top:50%;left:50%`, `gsap.set(outer, {xPercent:-50, yPercent:-50})` — same centering trick already used in `CustomCursor.jsx`) containing an inner `<HouseIcon>` sized ~`clamp(160px,26vw,300px)`.
- Entrance timeline (non-reduced-motion): outer scales `0 → 1`, inner spins in (`rotation: -120 → 0`, `back.out`), concurrent with existing wordmark `SplitText` + progress bar tweens.
- Keep the h1's own small icon slot present but `opacity:0` (it's just a measurement target for Stage 1, id'd via a ref) — the flying pentagon will visually occupy that spot instead.
- After `Promise.all([fontReady, minDelay])` (as today):
  - **Stage 1**: `flyTo(bigOuterRef, bigInnerRef, h1IconSlotRef, { duration: 0.9, spins: 3, ease: 'power3.inOut' })`, run concurrently with the existing exit tween for the wordmark chars/progress bar (so it reads as one "wrap up" beat).
  - On Stage 1 complete: kick off the container wipe (`yPercent:-100`, existing tween) **and** Stage 2 in parallel:
    - **Stage 2**: `flyTo(bigOuterRef, bigInnerRef, document.querySelector('[data-splash-nav-target]'), { duration: 0.55, spins: 2, ease: 'power2.in' })`.
    - If the nav target isn't found (defensive), skip Stage 2 and just fade the pentagon out with the rest.
  - On Stage 2 complete: hide the flying pentagon, set the real nav icon's opacity to 1 (seamless handoff, no double-flash), then run the existing `onComplete` cleanup (`sessionStorage` flag, `dispatchSplashComplete`, `setIsVisible(false)`).
- Reduced-motion branch: skip the whole pentagon build/spin/fly; just cross-fade the splash out (as today) and directly set the nav icon to opacity 1 in the completion callback.

## Sequence overview

```mermaid
sequenceDiagram
    participant Splash as SplashScreen
    participant Title as "career node" slot
    participant Nav as Nav logo icon
    Splash->>Splash: Pentagon scales in + spins at screen center
    Splash->>Splash: Wordmark + progress bar animate (existing)
    Splash->>Title: Stage 1 flyTo (shrink + 3x spin) lands at title slot
    Splash->>Splash: Text/progress exit + panel wipe-up starts
    Splash->>Nav: Stage 2 flyTo (shrink + 2x spin) lands at nav icon
    Nav->>Nav: Real nav icon opacity 0 -> 1 (handoff, pentagon hidden)
```

## Notes
- No new dependencies; reuses `HouseIcon`, existing GSAP setup (`registerGSAP`), and the fixed-position + `xPercent/yPercent` centering trick already established in `CustomCursor.jsx`.
- Both legs use plain rect-diff math (no GSAP Flip plugin) to stay consistent with the existing "outer/inner transform split" pattern already proven in `ToolkitShowcase.jsx`.
- `CustomCursor` already hides itself during the splash via `splashState.js`, so no change needed there.
