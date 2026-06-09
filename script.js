/**
 * Homepage — Apple-style scroll-driven frame sequence + story chapters
 */
(function () {
  'use strict';

  const TOTAL_FRAMES = 192;
  const FRAME_PATH = (i) =>
    `/homepage_frames/frame_${String(i + 1).padStart(4, '0')}.jpg`;

  const STAGES = [
    { start: 0, end: 39, side: 'left' },
    { start: 40, end: 79, side: 'right' },
    { start: 80, end: 119, side: 'left' },
    { start: 120, end: 159, side: 'right' },
    { start: 160, end: 191, side: 'left' },
  ];

  const canvas = document.getElementById('hero-canvas');
  const heroStory = document.getElementById('hero-story');
  const loader = document.getElementById('loader');
  const loaderPct = document.getElementById('loader-percent');
  const loaderFill = document.getElementById('loader-bar-fill');
  const layout = document.getElementById('hero-story-layout');
  const storyPanels = document.querySelectorAll('.story-panel');
  const finale = document.getElementById('hero-finale');
  const scrollHint = document.getElementById('scroll-hint');

  if (!canvas || !heroStory || !loader) return;

  const ctx = canvas.getContext('2d');
  const images = new Array(TOTAL_FRAMES);
  const panelState = new WeakMap();

  let canvasW = 0;
  let canvasH = 0;
  let uniformScale = 1;
  let targetFrame = 0;
  let displayFrame = 0;
  let drawnFrame = -1;
  let scrollProgress = 0;
  let needsRender = true;
  let rafId = null;
  let stInstance = null;
  let activeStage = -1;
  let storyReady = false;

  function splitHeadingWords(panel) {
    const heading = panel.querySelector('.story-heading');
    if (!heading || heading.dataset.splitReady === 'true') return;

    const words = heading.textContent.trim().split(/\s+/);
    heading.textContent = '';
    heading.dataset.splitReady = 'true';

    words.forEach((word, index) => {
      const wrap = document.createElement('span');
      wrap.className = 'story-word';
      const inner = document.createElement('span');
      inner.className = 'story-word-inner';
      inner.textContent = word;
      wrap.appendChild(inner);
      heading.appendChild(wrap);
      if (index < words.length - 1) {
        heading.appendChild(document.createTextNode(' '));
      }
    });
  }

  function initStoryPanels() {
    storyPanels.forEach((panel) => {
      splitHeadingWords(panel);
      panelState.set(panel, { words: panel.querySelectorAll('.story-word-inner') });
      gsap.set(panel, { autoAlpha: 0 });
    });
  }

  function getStageForFrame(frameIndex) {
    for (let i = 0; i < STAGES.length; i++) {
      if (frameIndex >= STAGES[i].start && frameIndex <= STAGES[i].end) {
        return i;
      }
    }
    return STAGES.length - 1;
  }

  function getStageLocalProgress(frameIndex, stageIndex) {
    const stage = STAGES[stageIndex];
    const span = stage.end - stage.start;
    return span > 0 ? (frameIndex - stage.start) / span : 0;
  }

  function setLayoutSide(side) {
    if (!layout) return;
    layout.classList.toggle('hero-story-layout--text-left', side === 'left');
    layout.classList.toggle('hero-story-layout--text-right', side === 'right');
  }

  function updateStoryUI(frameIndex, progress) {
    if (!storyReady || typeof gsap === 'undefined') return;

    const inFinale = progress >= 0.94;

    if (inFinale) {
      if (activeStage !== -2) {
        activeStage = -2;
        storyPanels.forEach((panel) => gsap.set(panel, { autoAlpha: 0 }));
        setLayoutSide('left');
      }

      const finaleProgress = Math.min(1, (progress - 0.94) / 0.06);
      gsap.set(finale, {
        autoAlpha: finaleProgress,
        y: (1 - finaleProgress) * 28,
        pointerEvents: finaleProgress > 0.6 ? 'auto' : 'none',
      });
      gsap.set('#hero-story-text, .hero-story-canvas-wrap', {
        autoAlpha: 1 - finaleProgress * 0.85,
      });
      return;
    }

    gsap.set(finale, { autoAlpha: 0, y: 24 });
    gsap.set('#hero-story-text, .hero-story-canvas-wrap', { autoAlpha: 1 });

    const stageIndex = getStageForFrame(frameIndex);
    const stage = STAGES[stageIndex];
    const local = getStageLocalProgress(frameIndex, stageIndex);

    if (stageIndex !== activeStage) {
      activeStage = stageIndex;
      setLayoutSide(stage.side);
    }

    storyPanels.forEach((panel, i) => {
      const state = panelState.get(panel);
      const words = state?.words || [];
      const isActive = i === stageIndex;
      const isPrev = i === stageIndex - 1;
      const isNext = i === stageIndex + 1;

      let panelOpacity = 0;
      let panelY = 32;
      let parallaxY = 0;

      if (isActive) {
        if (local < 0.12) {
          panelOpacity = local / 0.12;
          panelY = 32 * (1 - local / 0.12);
        } else if (local > 0.82) {
          const out = (local - 0.82) / 0.18;
          panelOpacity = 1 - out;
          panelY = -18 * out;
          parallaxY = -12 * out;
        } else {
          panelOpacity = 1;
          panelY = 0;
          parallaxY = (local - 0.12) * -10;
        }

        words.forEach((word, wi) => {
          const wordStart = wi / words.length;
          const wordEnd = (wi + 1) / words.length;
          const wordProgress = gsap.utils.clamp(
            0,
            1,
            (local - wordStart * 0.35) / 0.22
          );
          gsap.set(word, {
            y: (1 - wordProgress) * 110,
            autoAlpha: wordProgress,
          });
        });

        panel.querySelectorAll('.story-kw').forEach((kw, ki) => {
          const kwProgress = gsap.utils.clamp(0, 1, (local - 0.2 - ki * 0.04) / 0.25);
          gsap.set(kw, {
            autoAlpha: 0.55 + kwProgress * 0.45,
            textShadow: `0 0 ${kwProgress * 18}px rgba(212, 175, 55, ${kwProgress * 0.45})`,
          });
        });
      } else if (isPrev && local < 0.08 && stageIndex > 0) {
        panelOpacity = Math.max(0, 1 - local / 0.08);
        panelY = -24 * (1 - local / 0.08);
      } else if (isNext && local > 0.88) {
        const inProgress = (local - 0.88) / 0.12;
        panelOpacity = inProgress * 0.15;
        panelY = 24 * (1 - inProgress);
      }

      gsap.set(panel, {
        autoAlpha: panelOpacity,
        y: panelY + parallaxY,
      });
    });

    if (scrollHint) {
      gsap.set(scrollHint, { autoAlpha: Math.max(0, 1 - progress * 6) });
    }
  }

  function computeUniformScale(w, h) {
    let fitScale = Infinity;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = images[i];
      if (!img?.complete || !img.naturalWidth) continue;
      fitScale = Math.min(
        fitScale,
        w / img.naturalWidth,
        h / img.naturalHeight
      );
    }

    uniformScale = Number.isFinite(fitScale) ? fitScale : 1;
  }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);

    canvasW = w;
    canvasH = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    computeUniformScale(w, h);
    needsRender = true;
  }

  function drawFrame(img) {
    if (!img?.complete || !img.naturalWidth) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const dw = iw * uniformScale;
    const dh = ih * uniformScale;
    const x = (canvasW - dw) / 2;
    const y = (canvasH - dh) / 2;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, x, y, dw, dh);
  }

  function renderLoop() {
    displayFrame += (targetFrame - displayFrame) * 0.22;
    const frameIndex = Math.round(displayFrame);

    if (frameIndex !== drawnFrame || needsRender) {
      drawFrame(images[frameIndex]);
      drawnFrame = frameIndex;
      needsRender = false;
    }

    updateStoryUI(frameIndex, scrollProgress);
    rafId = requestAnimationFrame(renderLoop);
  }

  function preloadImages(onProgress, onComplete) {
    let loaded = 0;

    function onSettled() {
      loaded++;
      onProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
      if (loaded === TOTAL_FRAMES) onComplete();
    }

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = onSettled;
      img.onerror = () => {
        console.warn(`Frame failed: ${FRAME_PATH(i)}`);
        onSettled();
      };
      img.src = FRAME_PATH(i);
      images[i] = img;
    }
  }

  function initScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    initStoryPanels();

    stInstance = ScrollTrigger.create({
      trigger: heroStory,
      start: 'top top',
      end: '+=300%',
      pin: '.hero-story-pin',
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        scrollProgress = self.progress;
        targetFrame = self.progress * (TOTAL_FRAMES - 1);
      },
    });

    storyReady = true;
    setTimeout(() => ScrollTrigger.refresh(), 200);
  }

  function hideLoader() {
    loader.classList.add('hidden');
  }

  function boot() {
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });

    rafId = requestAnimationFrame(renderLoop);

    preloadImages(
      (pct) => {
        loaderPct.textContent = `${pct}%`;
        loaderFill.style.width = `${pct}%`;
      },
      () => {
        computeUniformScale(canvasW, canvasH);
        displayFrame = 0;
        targetFrame = 0;
        needsRender = true;
        hideLoader();
        initScroll();
      }
    );
  }

  boot();

  window.addEventListener('beforeunload', () => {
    if (stInstance) stInstance.kill();
    if (rafId) cancelAnimationFrame(rafId);
  });
})();
