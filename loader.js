/**
 * loader.js
 * Controls the loading screen: percentage, progress bar, fade-out.
 * Expects #loader, #loader-percent, #loader-bar in the DOM.
 */

const loader  = document.getElementById('loader');
const percent = document.getElementById('loader-percent');
const bar     = document.getElementById('loader-bar');

export function updateLoader(pct) {
  percent.textContent = pct + '%';
  bar.style.width     = pct + '%';
}

export function hideLoader() {
  loader.classList.add('done');
  // Remove from DOM after fade completes so it can't block clicks
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
}
