/**
 * final.js
 * Registers the final CTA section — frames 630–809.
 *
 * Fade-in   : frames 630 – 680  (progress 0.00 → 0.31)
 * Hold      : frames 680 – 809  (progress 0.31 → 1.00)
 *
 * Child elements stagger in during the fade-in window.
 */

import { registerOverlay } from './overlays.js';

const FADE_END = 0.31;

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Staggered opacity for each child block */
function staggerOpacity(progress, index, total) {
  if (progress >= FADE_END) return 1;
  const slotSize  = FADE_END / total;
  const start     = index * slotSize * 0.6;   // overlap slots slightly
  const end       = start + slotSize;
  if (progress < start) return 0;
  if (progress >= end)  return 1;
  return ease((progress - start) / (end - start));
}

export function initFinal() {
  const section = document.getElementById('final-section');
  if (!section) return;

  const blocks = Array.from(section.querySelectorAll('[data-stagger]'));

  registerOverlay('#final-section', 630, 809, (progress, el) => {
    // Panel opacity
    const panelT = progress <= FADE_END
      ? ease(progress / FADE_END)
      : 1;
    el.style.opacity = panelT;

    // Stagger children
    blocks.forEach((block, i) => {
      const op = staggerOpacity(progress, i, blocks.length);
      block.style.opacity   = op;
      block.style.transform = `translateY(${(1 - op) * 16}px) translateZ(0)`;
    });
  });
}
