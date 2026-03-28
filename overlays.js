/**
 * overlays.js
 * Frame-based UI visibility system.
 * Define which elements appear at which frame ranges, then call updateOverlays(frame).
 */

/**
 * Each entry maps a CSS selector to the frame range [start, end] (inclusive).
 * Optional `onProgress(progress, el)` receives a 0–1 value for smooth animation.
 *
 * Edit this array to control your UI.
 */
const OVERLAY_MAP = [
  // { selector: '#hero-text',   from: 8,  to: 75 },
  // { selector: '#feature-one', from: 100, to: 220 },
];

// Cache DOM lookups — built once on first call, never queried again
let cache = null;

function buildCache() {
  cache = OVERLAY_MAP.map(entry => ({
    el:         document.querySelector(entry.selector),
    from:       entry.from,
    to:         entry.to,
    onProgress: entry.onProgress || null,
  })).filter(entry => entry.el !== null); // skip missing elements silently
}

// ── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true if frame is within [from, to] (inclusive).
 * @param {number} frame
 * @param {number} from
 * @param {number} to
 */
function inRange(frame, from, to) {
  return frame >= from && frame <= to;
}

/**
 * Show an element (removes hidden attribute + restores visibility).
 * @param {HTMLElement} el
 */
function showEl(el) {
  el.hidden = false;
}

/**
 * Hide an element without removing it from layout flow.
 * Uses `hidden` attribute — pair with [hidden] { display:none } in CSS.
 * @param {HTMLElement} el
 */
function hideEl(el) {
  el.hidden = true;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Call every time the rendered frame changes.
 * Shows elements whose range includes `frame`, hides all others.
 *
 * @param {number} frame - current frame index (0–809)
 */
function updateOverlays(frame) {
  if (!cache) buildCache();

  for (const { el, from, to, onProgress } of cache) {
    if (inRange(frame, from, to)) {
      showEl(el);
      if (onProgress) {
        const progress = (frame - from) / (to - from); // 0 → 1
        onProgress(progress, el);
      }
    } else {
      hideEl(el);
    }
  }
}

/**
 * Register a new overlay at runtime (optional — editing OVERLAY_MAP is preferred).
 * Forces a cache rebuild on the next updateOverlays call.
 *
 * @param {string} selector
 * @param {number} from
 * @param {number} to
 */
function registerOverlay(selector, from, to, onProgress = null) {
  OVERLAY_MAP.push({ selector, from, to, onProgress });
  cache = null; // invalidate cache
}

export { updateOverlays, registerOverlay, inRange, showEl, hideEl };
