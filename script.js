// 1. Constants
const TOTAL_FRAMES = 192;
const FRAME_PATH = (i) =>
  `/frames/frame_${String(i + 1).padStart(4, '0')}.png`;

// 2. DOM references
const canvas      = document.getElementById('canvas');
const ctx         = canvas.getContext('2d');
const hero        = document.getElementById('hero');
const loader      = document.getElementById('loader');
const loaderPct   = document.getElementById('loader-percent');
const loaderFill  = document.getElementById('loader-bar-fill');

// 3. State variables
const SHOE_Y_OFFSET = 70;
const SHOE_SCALE = 1.2;
const SHOE_MAX_WIDTH = 980;
const images = new Array(TOTAL_FRAMES);
let frameIndex   = 0;   // current frame to draw
let needsRender  = true; // dirty flag for rAF loop
let rafId        = null;
let stInstance   = null;

// 4. Canvas resize function — match device pixel ratio for sharp rendering
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w   = window.innerWidth;
  const h   = window.innerHeight;

  canvas.width  = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width  = `${w}px`;
  canvas.style.height = `${h}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  needsRender = true;
}

// Call resizeCanvas() once on load.
window.addEventListener('load', () => {
  resizeCanvas();
});

window.addEventListener('resize', () => {
  resizeCanvas();
  ScrollTrigger.refresh();
});

// 5. drawFrame function — cover scaling, preserves aspect ratio, black fill
function drawFrame(img) {
  if (!img || !img.complete) return;
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const targetW = Math.min(SHOE_MAX_WIDTH, cw * 0.92);
  let scale = (targetW / iw) * SHOE_SCALE;
  if (iw * scale > cw * 0.96) scale = (cw * 0.96) / iw;
  const x = (cw - iw * scale) / 2;
  const y = (ch - ih * scale) / 2 + SHOE_Y_OFFSET;
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, iw * scale, ih * scale);
}

// 6. rAF render loop — never draw inside ScrollTrigger callback, only set dirty flag there
function startRenderLoop() {
  function loop() {
    if (needsRender) {
      drawFrame(images[frameIndex]);
      needsRender = false;
    }
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

// 7. Preload function — load all 192 images in parallel, track progress, resolve only after all complete
function preloadImages(onProgress, onComplete) {
  let loaded = 0;

  function onSettled() {
    loaded++;
    const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
    onProgress(pct);
    if (loaded === TOTAL_FRAMES) onComplete();
  }

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.onload  = onSettled;
    img.onerror = () => {
      console.warn(`Frame failed to load: ${FRAME_PATH(i)}`);
      onSettled();
    };
    img.src     = FRAME_PATH(i);
    images[i]   = img;
  }
}

// 8. GSAP init function — called only after all images loaded
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  stInstance = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: '+=4000',
    scrub: true,
    pin: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      const index = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(self.progress * TOTAL_FRAMES)
      );
      if (index !== frameIndex) {
        frameIndex  = index;
        needsRender = true;
      }
    },
  });

  // Allow browser to settle layout before refreshing
  setTimeout(() => ScrollTrigger.refresh(), 150);
}

// 9. Loader hide function
function hideLoader() {
  loader.classList.add('hidden');
}

// 10. Boot sequence — wire everything together
function boot() {
  resizeCanvas();
  startRenderLoop();
  
  // Create a placeholder image to draw immediately as black canvas
  const placeholder = new Image();
  placeholder.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  placeholder.onload = () => {
    if (frameIndex === 0 && needsRender) {
      drawFrame(placeholder);
    }
  };

  preloadImages(
    (pct) => {
      loaderPct.textContent  = pct + '%';
      loaderFill.style.width = pct + '%';
    },
    () => {
      // All images loaded
      frameIndex  = 0;
      needsRender = true;
      hideLoader();
      initGSAP();
    }
  );
}

boot();

// Cleanup for SPA or page unloading
window.addEventListener('beforeunload', () => {
  if (stInstance) stInstance.kill();
  if (rafId)      cancelAnimationFrame(rafId);
});
