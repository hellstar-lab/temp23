/**
 * panel.js
 * Sliding bike fleet panel — frames 480–610.
 *
 * Slide-in  : frames 480 – 520  (progress 0.00 → 0.31)
 * Hold      : frames 520 – 580  (progress 0.31 → 0.77)
 * Slide-out : frames 580 – 610  (progress 0.77 → 1.00)
 *
 * Cards stagger in during hold phase: each card delays by index * 0.06.
 */

import { registerOverlay } from './overlays.js';

const SLIDE_IN_END   = 0.31;
const SLIDE_OUT_START = 0.77;
const CARD_COUNT     = 6;

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Panel slides up from +100% of its own height */
function panelTransform(progress) {
  let ty, opacity;

  if (progress <= SLIDE_IN_END) {
    const t = ease(progress / SLIDE_IN_END);
    ty      = 100 * (1 - t);   // 100% → 0%
    opacity = t;
  } else if (progress <= SLIDE_OUT_START) {
    ty      = 0;
    opacity = 1;
  } else {
    const t = ease((progress - SLIDE_OUT_START) / (1 - SLIDE_OUT_START));
    ty      = 100 * t;         // 0% → 100%
    opacity = 1 - t;
  }

  return { ty, opacity };
}

/**
 * Cards stagger: each card becomes visible starting from a slightly
 * later point in the hold phase. progress within 0.31–0.77 window.
 */
function cardOpacity(progress, index) {
  const holdStart = SLIDE_IN_END;
  const holdEnd   = SLIDE_OUT_START;
  const holdLen   = holdEnd - holdStart;

  // Each card starts revealing 6% of total progress apart
  const cardStart = holdStart + (index / CARD_COUNT) * holdLen * 0.5;
  const cardEnd   = cardStart + holdLen * 0.18;

  if (progress < cardStart) return 0;
  if (progress > SLIDE_OUT_START) return 0;
  if (progress >= cardEnd) return 1;

  return ease((progress - cardStart) / (cardEnd - cardStart));
}

export function initPanel() {
  const panel = document.getElementById('bike-panel');
  if (!panel) return;

  const cards = Array.from(panel.querySelectorAll('.bike-card'));

  registerOverlay('#bike-panel', 480, 610, (progress, el) => {
    const { ty, opacity } = panelTransform(progress);
    el.style.opacity   = opacity;
    el.style.transform = `translateY(${ty}%) translateZ(0)`;

    // Stagger card visibility
    cards.forEach((card, i) => {
      card.style.opacity = cardOpacity(progress, i);
    });
  });
}
