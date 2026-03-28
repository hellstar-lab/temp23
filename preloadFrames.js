import { getFramePath } from './getFramePath.js';

const TOTAL_FRAMES = 810;

/**
 * Preloads all 810 animation frames.
 *
 * @param {Object} options
 * @param {function(percent: number, loaded: number, total: number): void} [options.onProgress]
 *   Called after each image settles (load or error). percent is 0–100.
 * @param {function(images: Array<HTMLImageElement|null>, failed: number[]): void} [options.onComplete]
 *   Called once all images have settled.
 *   - images[i] is the loaded HTMLImageElement, or null if that frame failed.
 *   - failed is an array of globalIndex values that errored.
 * @param {number} [options.concurrency=10]
 *   Max simultaneous in-flight image loads.
 * @returns {{ getPercent(): number, getImages(): Array, abort(): void }}
 *   Control handle — call abort() to stop mid-load.
 */
export function preloadFrames({ onProgress, onComplete, concurrency = 10 } = {}) {
  const images = new Array(TOTAL_FRAMES).fill(null);
  const failed = [];
  let settled = 0;
  let aborted = false;
  let nextIndex = 0;

  function getPercent() {
    return Math.round((settled / TOTAL_FRAMES) * 100);
  }

  function getImages() {
    return images;
  }

  function abort() {
    aborted = true;
  }

  function onSettle(index, img) {
    if (aborted) return;

    images[index] = img;
    settled++;

    const percent = getPercent();
    if (onProgress) onProgress(percent, settled, TOTAL_FRAMES);

    if (settled === TOTAL_FRAMES) {
      if (onComplete) onComplete(images, failed);
    } else {
      loadNext();
    }
  }

  function loadOne(index) {
    if (aborted) return;

    const img = new Image();
    const path = getFramePath(index);

    img.onload = () => onSettle(index, img);

    img.onerror = () => {
      failed.push(index);
      console.warn(`[preloadFrames] Failed to load frame ${index}: ${path}`);
      onSettle(index, null);
    };

    img.src = path;
  }

  function loadNext() {
    if (aborted || nextIndex >= TOTAL_FRAMES) return;
    loadOne(nextIndex++);
  }

  // Kick off up to `concurrency` loads at once
  const initialBatch = Math.min(concurrency, TOTAL_FRAMES);
  for (let i = 0; i < initialBatch; i++) {
    loadNext();
  }

  return { getPercent, getImages, abort };
}


// ---------------------------------------------------------------------------
// Node.js simulation test (validates logic without a real browser)
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && typeof window === 'undefined') {
  // Stub Image for Node
  global.Image = class {
    set src(url) {
      // Simulate async load; randomly fail ~2% to test error handling
      setTimeout(() => {
        if (Math.random() < 0.02) {
          if (this.onerror) this.onerror();
        } else {
          if (this.onload) this.onload();
        }
      }, Math.random() * 2); // 0–2 ms fake latency
    }
  };

  console.log('Starting preload simulation for 810 frames...\n');

  const milestones = new Set([25, 50, 75, 100]);

  const handle = preloadFrames({
    concurrency: 20,

    onProgress(percent, loaded, total) {
      if (milestones.has(percent)) {
        milestones.delete(percent); // log each milestone once
        console.log(`  Progress: ${percent}% (${loaded}/${total})`);
      }
    },

    onComplete(images, failed) {
      const loaded = images.filter(Boolean).length;
      console.log(`\nComplete!`);
      console.log(`  Loaded : ${loaded}/${TOTAL_FRAMES}`);
      console.log(`  Failed : ${failed.length}${failed.length ? ' — indices: ' + failed.slice(0, 10).join(', ') + (failed.length > 10 ? '…' : '') : ''}`);
      console.log(`  getPercent() => ${handle.getPercent()}%`);

      // Spot-check images array integrity
      let nullCount = images.filter(x => x === null).length;
      console.log(`  Null slots (failed frames): ${nullCount}`);
      console.log(nullCount === failed.length ? '[PASS] images array integrity OK' : '[FAIL] images array mismatch');
    },
  });

  console.log(`Handle returned. Initial getPercent() => ${handle.getPercent()}%`);
}
