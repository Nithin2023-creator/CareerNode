---
name: Mobile responsiveness overhaul
overview: Fix the critical mobile-breaking issues found across three parallel audits (dashboard shell, marketing landing page, tool pages) — no mobile dashboard navigation, overflowing/clipped nav and hero content, hover-only controls that are unusable on touch, and a fully desktop-only workflow builder — plus redesign the WorkflowBuilder for touch as requested.
todos:
  - id: nav-items-config
    content: Extract shared navItems config, build MobileNavDrawer, wire hamburger top bar + flex-col layout into AppLayout
    status: pending
  - id: public-nav-fix
    content: Fix PublicLayout nav overflow at 375px (responsive logo/CTA sizing, restore mobile Log in)
    status: pending
  - id: hero-bigcta-fix
    content: Fix HeroSection marquee/CTA overlap and remove BigCta's lg:text-[120px] override
    status: pending
  - id: lenis-touch-guard
    content: Guard initLenisScroll() behind pointer:coarse matchMedia check
    status: pending
  - id: touch-hover-fixes
    content: Make ResumeMakerPage preview/download and BundleCartDrawer remove button visible on touch/mobile
    status: pending
  - id: coldmailer-header-wrap
    content: Add flex-wrap to ColdMailerLayout header action cluster
    status: pending
  - id: workflow-builder-touch
    content: Redesign NodePalette as mobile drawer with tap-to-add; fix WorkflowBuilderPage top bar responsiveness
    status: pending
  - id: verify-mobile
    content: Test at 375/390/768/1024 widths and run npm run build
    status: pending
isProject: false
---

## Scope

Critical-path fixes only (moderate/minor polish items from the audits are deferred). One exception per your request: **WorkflowBuilder gets a real touch redesign**, not just a "use desktop" gate.

## Audit findings feeding this plan

Three parallel audits covered: layout shell + interactive components, all `src/pages/landing/*` marketing sections, and all `src/pages/{job-finder,cold-mailer,automations}` tool pages. Full findings available in agent [e0470a8d](e0470a8d-15e5-46be-91ba-658a4ac14e7b) history; critical items are summarized below by fix area.

---

## 1. Dashboard shell has zero mobile navigation (highest priority)

[src/components/layout/Sidebar.jsx](src/components/layout/Sidebar.jsx) is `hidden lg:flex` (line 15) with no fallback — below 1024px, users cannot navigate between Dashboard/Job Finder/Cold Mailer/Resume Maker/Automations at all.

**Fix:**
- Extract the `navItems` array out of `Sidebar.jsx` into a small shared constant (e.g. `src/config/navItems.js`) so both the desktop sidebar and a new mobile nav render identical links.
- New `src/components/layout/MobileNavDrawer.jsx`: slide-in drawer from the left (reuse the backdrop/spring pattern from [JobFinderIntroModal.jsx](src/components/job-finder/JobFinderIntroModal.jsx)), listing the same nav cards, closes on link click or backdrop tap.
- [src/components/layout/AppLayout.jsx](src/components/layout/AppLayout.jsx): add a `lg:hidden` top bar (hamburger button + wordmark) above `<main>`; change the wrapper from `flex` to `flex-col lg:flex-row`; change `ml-6` to `ml-0 lg:ml-6`; keep the sidebar `sticky` wrapper `hidden lg:block`.

## 2. Public nav overflow at narrow widths

[src/components/layout/PublicLayout.jsx](src/components/layout/PublicLayout.jsx) lines 24-41: logo badge + "Log in" (`hidden sm:block`) + DASHBOARD CTA together exceed ~343px content width at 375px viewport, and nothing wraps.

**Fix:** shrink logo/CTA padding and font size below `sm` (`px-4 text-lg sm:px-6 sm:text-2xl`), restore "Log in" visibility on mobile as an icon-only or smaller pill instead of `hidden sm:block`, add `min-w-0`/`gap-2` so items don't force overflow.

## 3. Hero marquee overlaps CTAs; BigCta headline overflows

- [src/pages/landing/HeroSection.jsx](src/pages/landing/HeroSection.jsx): `.hero-marquee` is `absolute bottom-8` (line 110) inside a vertically-centered `min-h-[100svh]` section — on short mobile viewports it can sit on top of the CTA row. Fix: reserve bottom padding equal to marquee height on mobile, or make marquee `static`/in-flow below the CTAs under `max-lg`.
- [src/pages/landing/BigCta.jsx](src/pages/landing/BigCta.jsx) line 13: `text-fluid-h2 lg:text-[120px]` — the fixed `120px` override defeats the fluid clamp at `lg` and can overflow on narrower tablets/small laptops. Fix: remove the `lg:text-[120px]` override, or cap it inside a clamp (`clamp(48px, 6vw, 96px)` already covers this — just delete the override).

## 4. Lenis smooth-scroll has no mobile/touch guard

[src/lib/lenisScroll.js](src/lib/lenisScroll.js): `initLenisScroll()` always constructs a `Lenis` instance, used unconditionally from both `PublicLayout` and `AppLayout`. This is a known source of scroll jank on iOS/touch when combined with ScrollTrigger pinning.

**Fix:** guard construction with `window.matchMedia('(pointer: coarse)').matches` — skip Lenis entirely on touch devices and fall back to native scrolling (ScrollTrigger still works fine without the Lenis proxy on native scroll).

## 5. Hover-only controls that fully block actions on touch

- [src/pages/ResumeMakerPage.jsx](src/pages/ResumeMakerPage.jsx) lines 71-77: PREVIEW / DOWNLOAD PDF buttons only appear on `group-hover` — permanently hidden on touch. Fix: always show these buttons on `<lg` (or use `group-focus-within`/tap-to-reveal), keep hover reveal as a desktop enhancement only above `lg`.
- [src/components/cold-mailer/BundleCartDrawer.jsx](src/components/cold-mailer/BundleCartDrawer.jsx) lines 72-77: remove button is `opacity-0 group-hover:opacity-100` — unreachable on touch. Fix: always visible on `<lg`, matching how [CartDrawer.jsx](src/components/job-finder/CartDrawer.jsx) already does it unconditionally.

## 6. Cold Mailer layout header overflow

[src/components/layout/ColdMailerLayout.jsx](src/components/layout/ColdMailerLayout.jsx) lines 37-70: wallet badge + cart icon + conditional "NEW CAMPAIGN" button in one non-wrapping `flex` row — exceeds available width inside the (already narrow) mobile main frame. Fix: `flex-wrap` this action cluster, or move it to a second row below `md`.

## 7. WorkflowBuilder — touch redesign

[src/pages/automations/WorkflowBuilderPage.jsx](src/pages/automations/WorkflowBuilderPage.jsx) + [src/components/automations/NodePalette.jsx](src/components/automations/NodePalette.jsx): palette is a fixed `300px` column using HTML5 `draggable`/`onDragStart` only (no touch drag), and the top bar has fixed-width elements (`w-64 md:w-96` name input, unwrapped action buttons).

**Fix:**
- `NodePalette.jsx`: on `<lg`, render as a bottom-sheet/off-canvas drawer toggled by a floating "+ Add Node" button instead of a permanent 300px column (`hidden lg:flex` for the static column, new drawer variant for `lg:hidden`).
- Add tap-to-add: `onClick` on each palette item adds the node to the canvas (e.g. at the current viewport center via React Flow's `screenToFlowPosition`) and closes the drawer — keep existing `draggable`/`onDragStart` behavior for desktop, so both interaction modes work.
- `WorkflowBuilderPage.jsx` top bar: name input `w-full sm:w-64 md:w-96`, wrap the action button cluster (`flex-wrap gap-2`) or collapse secondary actions into an overflow menu below `md`.
- React Flow's canvas pan/zoom already supports touch gestures natively (`@xyflow/react` default `panOnDrag`/`zoomOnPinch`) — no change needed there.

## Verification

- Test at 375px, 390px, 768px, 1024px widths (Chrome device toolbar) across: landing page scroll, `/dashboard` nav via drawer, Cold Mailer header, Resume Maker preview/download, Bundle cart remove, Workflow Builder add-node-by-tap.
- `npm run build` to confirm no regressions.

## Deferred (moderate/minor, out of scope for this pass)

Table→card fallbacks (Wallet transactions, Campaign recipients), testimonial dot tap-target sizing + touch-pause, FAQ `max-h-96` clipping, `SubscriptionsPage` 2-col stat grid tightness, `ProgressPipeline` 5-step crowding, marquee `prefers-reduced-motion`, parallax `matchMedia` gating, and other minor items noted in the audits.
