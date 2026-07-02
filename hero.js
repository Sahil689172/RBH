/**
 * RBH Homepage Hero — Apple-style scroll frame sequence
 */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  gsap.registerPlugin(ScrollTrigger);

  const TOTAL_FRAMES = 185;
  const FRAME_PATH = (i) =>
    `/homepage_frames/frame_${String(i).padStart(4, '0')}.jpg`;

  const images = [];
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  let currentFrameIndex = 0;

  function drawFrame(index) {
    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    const img = images[clampedIndex];
    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const dx = (cw - drawW) / 2;
    const dy = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    currentFrameIndex = clampedIndex;
  }

  async function preloadFrames() {
    const promises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = FRAME_PATH(i + 1);
        img.onload = () => {
          images[i] = img;
          resolve();
        };
        img.onerror = () => {
          images[i] = null;
          resolve();
        };
      });
    });
    await Promise.all(promises);
  }

  function animateBeatIn(selector) {
    gsap.killTweensOf(selector);
    gsap.fromTo(
      selector,
      { opacity: 0, y: 28, xPercent: -50 },
      { opacity: 1, y: 0, xPercent: -50, duration: 0.55, ease: 'power2.out' }
    );
  }

  function animateBeatOut(selector) {
    gsap.killTweensOf(selector);
    gsap.to(selector, {
      opacity: 0,
      y: -20,
      xPercent: -50,
      duration: 0.4,
      ease: 'power2.in',
    });
  }

  async function init() {
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawFrame(currentFrameIndex);
    });

    await preloadFrames();

    const loader = document.getElementById('hero-loader');
    gsap.to(loader, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        loader.style.display = 'none';
      },
    });

    const pageLoader = document.getElementById('loader');
    if (pageLoader) {
      pageLoader.classList.add('hidden');
    }

    drawFrame(0);

    const progressBar = document.getElementById('scroll-progress-bar');
    gsap.to(progressBar, { opacity: 1, duration: 0.3 });

    ScrollTrigger.create({
      trigger: '#hero-scroll-section',
      start: 'top top',
      end: '+=500%',
      pin: '#hero-sticky',
      scrub: 1.2,
      onUpdate: (self) => {
        const progress = self.progress;

        const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
        drawFrame(frameIndex);

        progressBar.style.height = `${progress * 100}%`;

        if (progress >= 0.95) {
          const ctaProgress = (progress - 0.95) / 0.05;
          gsap.set('#hero-cta', { opacity: ctaProgress });
        } else {
          gsap.set('#hero-cta', { opacity: 0 });
        }
      },
    });

    ScrollTrigger.create({
      trigger: '#hero-scroll-section',
      start: 'top top',
      end: '28% top',
      scrub: true,
      onEnter: () => animateBeatIn('#beat-1'),
      onLeave: () => animateBeatOut('#beat-1'),
      onEnterBack: () => animateBeatIn('#beat-1'),
      onLeaveBack: () => animateBeatOut('#beat-1'),
    });

    ScrollTrigger.create({
      trigger: '#hero-scroll-section',
      start: '33% top',
      end: '63% top',
      scrub: true,
      onEnter: () => animateBeatIn('#beat-2'),
      onLeave: () => animateBeatOut('#beat-2'),
      onEnterBack: () => animateBeatIn('#beat-2'),
      onLeaveBack: () => animateBeatOut('#beat-2'),
    });

    ScrollTrigger.create({
      trigger: '#hero-scroll-section',
      start: '66% top',
      end: '92% top',
      scrub: true,
      onEnter: () => animateBeatIn('#beat-3'),
      onLeave: () => animateBeatOut('#beat-3'),
      onEnterBack: () => animateBeatIn('#beat-3'),
      onLeaveBack: () => animateBeatOut('#beat-3'),
    });

    gsap.set('.hero-beat', { xPercent: -50 });
    gsap.set(['#beat-2', '#beat-3'], { opacity: 0, y: 28 });
    animateBeatIn('#beat-1');

    ScrollTrigger.refresh();
  }

  init();
})();
