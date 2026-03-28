/**
 * cursor.js
 * Custom cursor: small dot (exact) + larger ring (lagged LERP follow).
 * Hover over [data-cursor] elements triggers scale + blend effects.
 */

const DOT_SIZE    = 6;
const RING_SIZE   = 36;
const RING_LERP   = 0.10;   // ring lag factor (lower = more lag)

let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;
let ringX  = mouseX;
let ringY  = mouseY;

let dot, ring;
let isHover   = false;
let isVisible = false;

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function initCursor() {
  // Build elements
  dot  = document.getElementById('cursor-dot');
  ring = document.getElementById('cursor-ring');

  // Hide native cursor globally
  document.documentElement.style.cursor = 'none';

  // Track mouse
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseenter', onMouseEnter);
  document.addEventListener('mouseleave', onMouseLeave);

  // Hover detection via event delegation
  document.addEventListener('mouseover',  onOver);
  document.addEventListener('mouseout',   onOut);

  requestAnimationFrame(tick);
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (!isVisible) {
    // Snap ring to mouse on first move so it doesn't drift in from 0,0
    ringX = mouseX;
    ringY = mouseY;
    isVisible = true;
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  }
}

function onMouseEnter() {
  isVisible = true;
  dot.style.opacity  = '1';
  ring.style.opacity = '1';
}

function onMouseLeave() {
  isVisible = false;
  dot.style.opacity  = '0';
  ring.style.opacity = '0';
}

function onOver(e) {
  const el = e.target.closest('[data-cursor], a, button, .btn, .bike-card');
  if (el) setHover(true);
}

function onOut(e) {
  const to = e.relatedTarget;
  if (!to || !to.closest('[data-cursor], a, button, .btn, .bike-card')) {
    setHover(false);
  }
}

function setHover(state) {
  if (isHover === state) return;
  isHover = state;
  ring.classList.toggle('cursor-hover', state);
  dot.classList.toggle('cursor-hover',  state);
}

function tick() {
  requestAnimationFrame(tick);

  // LERP ring toward mouse
  ringX += (mouseX - ringX) * RING_LERP;
  ringY += (mouseY - ringY) * RING_LERP;

  // Dot: exact position, offset to center
  dot.style.transform  = `translate(${mouseX - DOT_SIZE / 2}px, ${mouseY - DOT_SIZE / 2}px) translateZ(0)`;
  // Ring: lagged, offset to center
  ring.style.transform = `translate(${ringX - RING_SIZE / 2}px, ${ringY - RING_SIZE / 2}px) translateZ(0)`;
}
