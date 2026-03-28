/**
 * mobile.js
 * Mobile / touch optimisations:
 *  - Detects touch device and exposes isMobile()
 *  - Hides custom cursor on touch devices
 *  - Increases LERP factor so scroll feels snappier on mobile
 *    (touch momentum already provides smoothness — heavy LERP just adds lag)
 */

const TOUCH_LERP = 0.22;   // faster than desktop 0.12 — less perceived lag on touch
const DESK_LERP  = 0.12;

/** True when primary input is touch (set once on first touchstart) */
let _isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export function isMobile() { return _isMobile; }

export function getLerpFactor() {
  return _isMobile ? TOUCH_LERP : DESK_LERP;
}

export function initMobile() {
  if (!_isMobile) return;

  // Hide cursor elements — they serve no purpose on touch
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot)  dot.style.display  = 'none';
  if (ring) ring.style.display = 'none';

  // Restore native cursor (initCursor sets cursor:none on <html>)
  document.documentElement.style.cursor = '';

  // Suppress cursor init side-effects by marking html element
  document.documentElement.setAttribute('data-touch', '');
}
