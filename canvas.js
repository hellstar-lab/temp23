/**
 * canvas.js
 * High-performance canvas setup with devicePixelRatio scaling and GPU acceleration.
 * Call initCanvas() once on DOMContentLoaded.
 */

let canvas, ctx, dpr;

function initCanvas() {
  canvas = document.getElementById('frame-canvas');
  dpr = window.devicePixelRatio || 1;

  // GPU acceleration via CSS
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.willChange = 'transform';
  canvas.style.transform = 'translateZ(0)';

  // Image smoothing for crisp upscaling
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  return { canvas, ctx, getDpr: () => dpr };
}

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;

  const w = window.innerWidth;
  const h = window.innerHeight;

  // Physical pixels
  canvas.width  = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  // CSS size stays at logical pixels
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';

  // Scale all draw calls by dpr once
  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // High-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

/**
 * Draws a frame image cover-fitted to the full viewport (like CSS background-size: cover).
 * Call this whenever you want to paint a new frame.
 *
 * @param {HTMLImageElement} img
 */
function drawFrame(img) {
  if (!ctx || !img) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  // Cover fit: scale so the image fills the canvas, cropping excess
  const scale = Math.max(cw / iw, ch / ih);
  const sw = iw * scale;
  const sh = ih * scale;
  const sx = (cw - sw) / 2;
  const sy = (ch - sh) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, sx, sy, sw, sh);
}

/**
 * Renders a specific frame from the preloaded images array.
 * Silently skips if the image at that index hasn't loaded (null slot).
 *
 * @param {number} index - globalIndex 0–809
 * @param {Array<HTMLImageElement|null>} images - array from preloadFrames
 */
function renderFrame(index, images) {
  const img = images[index];
  if (!img) return; // not loaded or failed — skip silently
  drawFrame(img);
}

export { initCanvas, resizeCanvas, drawFrame, renderFrame };
