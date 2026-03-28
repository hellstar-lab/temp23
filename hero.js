/**
 * hero.js
 * Registers the hero section with the overlay system.
 * Drives opacity + translateY based on frame progress (8 → 75).
 *
 * Fade-in  : frames  8 – 30  (progress 0.00 → 0.33)
 * Hold     : frames 30 – 55  (progress 0.33 → 0.70)
 * Fade-out : frames 55 – 75  (progress 0.70 → 1.00)
 */

import { registerOverlay } from './overlays.js';

const FADE_IN_END   = 0.33;  // progress where fade-in finishes
const FADE_OUT_START = 0.70; // progress where fade-out begins

/** Smooth ease: cubic in-out */
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Maps progress → { opacity, translateY } */
function heroStyle(progress) {
  let opacity, ty;

  if (progress <= FADE_IN_END) {
    // Fade in: 0 → 1
    const t = easeInOut(progress / FADE_IN_END);
    opacity = t;
    ty      = 28 * (1 - t); // slides up from +28px
  } else if (progress <= FADE_OUT_START) {
    // Hold
    opacity = 1;
    ty      = 0;
  } else {
    // Fade out: 1 → 0
    const t = easeInOut((progress - FADE_OUT_START) / (1 - FADE_OUT_START));
    opacity = 1 - t;
    ty      = -20 * t; // slides up toward -20px on exit
  }

  return { opacity, ty };
}

export function initHero() {
  registerOverlay('#hero', 8, 75, (progress, el) => {
    const { opacity, ty } = heroStyle(progress);
    el.style.opacity   = opacity;
    el.style.transform = `translateY(${ty}px) translateZ(0)`;
  });
}
