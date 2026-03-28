/**
 * main.js
 * Entry point. Wires preload → canvas → scroll engine in the correct order.
 *
 * Expected HTML:
 *   <canvas id="frame-canvas"></canvas>
 *   <!-- body tall enough to scroll: e.g. height: 500vh -->
 */

import { preloadFrames }            from './preloadFrames.js';
import { initCanvas }               from './canvas.js';
import { startScrollEngine }        from './scrollEngine.js';
import { updateLoader, hideLoader } from './loader.js';
import { initHero }                 from './hero.js';
import { initCallouts }             from './callouts.js';
import { initPanel }               from './panel.js';
import { initFinal }               from './final.js';
import { initCursor }              from './cursor.js';
import { initMobile }              from './mobile.js';

document.addEventListener('DOMContentLoaded', () => {

  // 1. Canvas + overlay setup
  initMobile();   // must be first — sets data-touch before cursor init
  initCanvas();
  initHero();
  initCallouts();
  initPanel();
  initFinal();
  initCursor();

  // 2. Preload all 810 frames
  preloadFrames({
    concurrency: 10,

    onProgress(pct) {
      updateLoader(pct);
    },

    onComplete(images, failed) {
      if (failed.length) {
        console.warn(`[main] ${failed.length} frame(s) failed to load.`);
      }

      // 3. Hide loader, then start scroll engine
      hideLoader();
      startScrollEngine(images);
    },
  });

});
