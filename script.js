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

// 3. State variables — viewport padding keeps the full shoe clear of hero copy
const VIEWPORT_PAD_X = 0.06;
const VIEWPORT_PAD_TOP = 0.13;
const VIEWPORT_PAD_BOTTOM = 0.15;
const images = new Array(TOTAL_FRAMES);
let frameIndex   = 0;   // current frame to draw
let needsRender  = true; // dirty flag for rAF loop
let uniformScale = 1; // same scale for every frame (contain, no crop)
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

  computeUniformScale();
  needsRender = true;
}

// Fit every frame inside the viewport — uniform scale, centered, no cropping
function computeUniformScale() {
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const usableW = cw * (1 - VIEWPORT_PAD_X * 2);
  const usableH = ch * (1 - VIEWPORT_PAD_TOP - VIEWPORT_PAD_BOTTOM);

  let fitScale = Infinity;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = images[i];
    if (!img?.complete || !img.naturalWidth) continue;

    const scale = Math.min(
      usableW / img.naturalWidth,
      usableH / img.naturalHeight
    );
    fitScale = Math.min(fitScale, scale);
  }

  uniformScale = Number.isFinite(fitScale) ? fitScale : 1;
}

// Call resizeCanvas() once on load.
window.addEventListener('load', () => {
  resizeCanvas();
});

window.addEventListener('resize', () => {
  resizeCanvas();
  ScrollTrigger.refresh();
});

// 5. drawFrame — object-fit: contain behavior, uniform scale, centered
function drawFrame(img) {
  if (!img || !img.complete || !img.naturalWidth) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const dw = iw * uniformScale;
  const dh = ih * uniformScale;
  const x = (cw - dw) / 2;
  const y = (ch - dh) / 2;

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, dw, dh);
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
      computeUniformScale();
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
