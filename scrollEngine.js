/**
 * scrollEngine.js
 * Converts scroll position → frame index with LERP smoothing.
 */

import { renderFrame }    from './canvas.js';
import { updateOverlays } from './overlays.js';
import { getLerpFactor }  from './mobile.js';

const TOTAL_FRAMES = 810;

let images       = [];
let targetFrame  = 0;
let currentFrame = 0;
let rafId        = null;
let lastDrawn    = -1;  // track last rendered frame to skip redundant draws

/**
 * Maps current scroll position to a frame index (0–809).
 * Scroll range = document height minus one viewport height.
 */
function scrollToFrame() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress  = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
  return progress * (TOTAL_FRAMES - 1);
}

function tick() {
  rafId = requestAnimationFrame(tick);

  targetFrame  = scrollToFrame();
  currentFrame += (targetFrame - currentFrame) * getLerpFactor();

  // Snap to target when close enough to avoid infinite micro-updates
  if (Math.abs(targetFrame - currentFrame) < 0.1) {
    currentFrame = targetFrame;
  }

  const frameIndex = Math.round(currentFrame);

  // Skip draw if the integer frame hasn't changed
  if (frameIndex === lastDrawn) return;
  lastDrawn = frameIndex;

  renderFrame(frameIndex, images);
  updateOverlays(frameIndex);
}

/**
 * Starts the scroll engine.
 *
 * @param {Array<HTMLImageElement|null>} loadedImages - from preloadFrames onComplete
 */
function startScrollEngine(loadedImages) {
  images = loadedImages;

  // Draw frame 0 immediately
  currentFrame = 0;
  targetFrame  = 0;
  lastDrawn    = -1;
  renderFrame(0, images);

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function stopScrollEngine() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export { startScrollEngine, stopScrollEngine };

