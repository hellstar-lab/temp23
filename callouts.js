/**
 * callouts.js
 * Registers 5 bike-detail callout components with the overlay system.
 * Each callout uses scale + opacity driven by scroll progress.
 *
 * Frame map (out of 810 total):
 *   #callout-frame   120 – 210   (front fork / frame geometry)
 *   #callout-motor   230 – 320   (electric motor)
 *   #callout-battery 340 – 430   (battery pack)
 *   #callout-brakes  450 – 540   (hydraulic brakes)
 *   #callout-display 560 – 640   (handlebar display)
 */

import { registerOverlay } from './overlays.js';

const FADE_IN_END    = 0.25;
const FADE_OUT_START = 0.75;

/** Cubic ease-in-out */
function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Shared animation curve for all callouts.
 * Returns opacity (0–1) and scale (0.88–1).
 */
function calloutStyle(progress) {
  let opacity, scale;

  if (progress <= FADE_IN_END) {
    const t = ease(progress / FADE_IN_END);
    opacity = t;
    scale   = 0.88 + 0.12 * t;          // 0.88 → 1.00
  } else if (progress <= FADE_OUT_START) {
    opacity = 1;
    scale   = 1;
  } else {
    const t = ease((progress - FADE_OUT_START) / (1 - FADE_OUT_START));
    opacity = 1 - t;
    scale   = 1 - 0.08 * t;             // 1.00 → 0.92
  }

  return { opacity, scale };
}

function makeHandler() {
  return (progress, el) => {
    const { opacity, scale } = calloutStyle(progress);
    el.style.opacity   = opacity;
    el.style.transform = `scale(${scale}) translateZ(0)`;
  };
}

export function initCallouts() {
  registerOverlay('#callout-frame',   120, 210, makeHandler());
  registerOverlay('#callout-motor',   230, 320, makeHandler());
  registerOverlay('#callout-battery', 340, 430, makeHandler());
  registerOverlay('#callout-brakes',  450, 540, makeHandler());
  registerOverlay('#callout-display', 560, 640, makeHandler());
}
