/**
 * About page — hero fade & timeline ScrollTrigger animations
 *
 * Timeline GIFs (public2/, one per entry in order):
 * g1.gif → 1959 | g2.gif → 1970 | g3.gif → 1984 | g4.gif → 1987 | g5.gif → 1990s
 * g6.gif → 2009 | g7.gif → 2013 | g8.gif → 2024 | g9.gif → Today
 */

(function () {
  'use strict';

  const TIMELINE_GIFS = [
    'g1.gif',
    'g2.gif',
    'g3.gif',
    'g4.gif',
    'g5.gif',
    'g6.gif',
    'g7.gif',
    'g8.gif',
    'g9.gif',
  ];

  const page = document.querySelector('.about-page');
  if (!page) return;

  if (typeof gsap === 'undefined') {
    return;
  }

  page.classList.add('js-ready');
  gsap.registerPlugin(ScrollTrigger);

  const timelineEntries = [];

  function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function stopGifFloat(gifEl) {
    if (!gifEl) return;
    if (gifEl.dataset.floating !== 'true') return;
    gsap.killTweensOf(gifEl);
    gsap.set(gifEl, { y: 0 });
    gifEl.dataset.floating = 'false';
  }

  function startGifFloat(gifEl) {
    if (!gifEl) return;
    if (gifEl.dataset.floating === 'true') return;
    stopGifFloat(gifEl);

    gsap.to(gifEl, {
      y: isMobileViewport() ? -4 : -8,
      duration: isMobileViewport() ? 3.5 : 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gifEl.dataset.floating = 'true';
  }

  const gifCache = new Map();

  function preloadGif(src) {
    if (gifCache.has(src)) return gifCache.get(src);
    const promise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      const done = async () => {
        if (typeof img.decode === 'function') {
          try {
            await img.decode();
          } catch (_err) {
            /* ignore decode failures */
          }
        }
        resolve();
      };
      img.onload = () => void done();
      img.onerror = () => resolve();
      img.src = src;
    });
    gifCache.set(src, promise);
    return promise;
  }

  function initTimelineGifLazyLoader() {
    const images = Array.from(
      document.querySelectorAll('.timeline-gif-container img'),
    );
    if (!images.length) return;

    const srcByImg = new Map();

    images.forEach((img) => {
      const deferred = img.dataset.src;
      const src = deferred || img.getAttribute('src') || '';
      if (src) srcByImg.set(img, src);
      if (deferred) img.removeAttribute('src');
    });

    TIMELINE_GIFS.slice(0, 2).forEach((name) => {
      void preloadGif(`/public2/${name}`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const src = srcByImg.get(img);
          if (!src) {
            observer.unobserve(img);
            return;
          }

          void preloadGif(src).then(() => {
            if (!img.src) img.src = src;
            ScrollTrigger.refresh(false);
            syncInitialTimelineState();
          });

          const index = images.indexOf(img);
          const next = images[index + 1];
          const nextSrc = next ? srcByImg.get(next) : null;
          if (nextSrc) void preloadGif(nextSrc);

          observer.unobserve(img);
        });
      },
      { rootMargin: '280px 0px', threshold: 0 },
    );

    images.forEach((img, index) => {
      if (img.dataset.fallbackReady === 'true') return;
      img.dataset.fallbackReady = 'true';

      if (index < 2 && !img.dataset.src) {
        const src = srcByImg.get(img);
        if (src) void preloadGif(src);
        if (img.complete) {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh(false);
            syncInitialTimelineState();
          });
        } else {
          img.addEventListener(
            'load',
            () => {
              ScrollTrigger.refresh(false);
              syncInitialTimelineState();
            },
            { once: true },
          );
        }
        img.addEventListener('error', () => {
          const entry = img.closest('.timeline-entry');
          const fallback = entry?.dataset.gif;
          if (fallback && img.src !== new URL(fallback, window.location.href).href) {
            img.src = fallback;
          }
        });
        return;
      }

      observer.observe(img);
      img.addEventListener('error', () => {
        const entry = img.closest('.timeline-entry');
        const fallback = entry?.dataset.gif;
        if (fallback && img.src !== new URL(fallback, window.location.href).href) {
          img.src = fallback;
        }
      });
    });
  }

  function syncInitialTimelineState() {
    if (isMobileViewport()) {
      timelineEntries.forEach((entry) => {
        const dot = entry.querySelector('.timeline-dot');
        const connector = entry.querySelector('.timeline-connector');
        const card = entry.querySelector('.timeline-card');
        const year = entry.querySelector('.timeline-year');
        const gif = entry.querySelector('.timeline-gif-container');

        if (dot) gsap.set(dot, { scale: 1 });
        if (connector) gsap.set(connector, { scaleX: 1 });
        if (card) gsap.set(card, { x: 0, y: 0, opacity: 1 });
        if (year) gsap.set(year, { y: 0, opacity: 1 });
        if (gif) gsap.set(gif, { x: 0, y: 0, scale: 1, opacity: 1, visibility: 'visible' });
      });
      return;
    }

    timelineEntries.forEach((entry) => {
      const trigger = ScrollTrigger.getById(entry.dataset.timelineTriggerId);
      const anim = trigger?.animation;
      const gif = entry.querySelector('.timeline-gif-container');
      if (!trigger || !anim) return;

      if (trigger.progress > 0.001) {
        anim.progress(trigger.progress);
        if (gif) {
          if (trigger.progress >= 0.9) startGifFloat(gif);
          else stopGifFloat(gif);
        }
      }
    });
  }

  function refreshScrollTriggers(runInitialSync) {
    ScrollTrigger.refresh(false);

    if (runInitialSync) {
      requestAnimationFrame(() => {
        syncInitialTimelineState();
        syncClosingRevealState();
      });
    }
  }

  function syncClosingRevealState() {
    const closing = document.querySelector('.about-closing-inner');
    if (!closing || isMobileViewport()) return;

    const triggers = ScrollTrigger.getAll().filter(
      (st) => st.trigger === closing,
    );
    const st = triggers[0];
    const anim = st?.animation;
    if (anim && st.progress > 0.001) {
      anim.progress(st.progress);
    }
  }

  function splitHeroWords(root) {
    if (!root || root.dataset.splitReady === 'true') return;

    const words = root.textContent.trim().split(/\s+/);
    root.textContent = '';
    root.dataset.splitReady = 'true';

    words.forEach((word, index) => {
      const wrap = document.createElement('span');
      wrap.className = 'about-hero-word';

      const inner = document.createElement('span');
      inner.className = 'about-hero-word-inner';
      inner.textContent = word;

      wrap.appendChild(inner);
      root.appendChild(wrap);

      if (index < words.length - 1) {
        root.appendChild(document.createTextNode(' '));
      }
    });
  }

  function initHeroFade() {
    const hero = document.querySelector('.about-hero');
    if (!hero) return;

    const label = hero.querySelector('.about-hero-label');
    const labelText = hero.querySelector('.about-hero-label-text');
    const sparks = hero.querySelectorAll('.about-hero-spark');
    const title = hero.querySelector('.page-hero-title');
    const sub = hero.querySelector('.page-hero-sub');
    const divider = document.querySelector('.about-hero-divider');

    splitHeroWords(title);
    splitHeroWords(sub);

    const titleWords = title.querySelectorAll('.about-hero-word-inner');
    const subWords = sub.querySelectorAll('.about-hero-word-inner');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      gsap.set([label, titleWords, subWords, divider], { clearProps: 'all', opacity: 1 });
      return;
    }

    gsap.set(label, { opacity: 0 });
    gsap.set(labelText, { y: 14, opacity: 0, letterSpacing: '0.5em' });
    gsap.set(sparks, { scale: 0, rotate: -45, opacity: 0, transformOrigin: 'center center' });
    gsap.set(titleWords, { yPercent: 115, opacity: 0 });
    gsap.set(subWords, { yPercent: 110, opacity: 0 });
    if (divider) {
      gsap.set(divider, { scaleX: 0, opacity: 0, transformOrigin: 'center center' });
    }

    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .to(label, { opacity: 1, duration: 0.4 })
      .to(sparks, { scale: 1, rotate: 0, opacity: 1, duration: 0.65, stagger: 0.12, ease: 'back.out(2)' }, '-=0.2')
      .to(labelText, { y: 0, opacity: 1, duration: 0.75, letterSpacing: '0.32em' }, '-=0.45')
      .to(titleWords, { yPercent: 0, opacity: 1, duration: 0.82, stagger: 0.07 }, '-=0.5')
      .to(subWords, { yPercent: 0, opacity: 1, duration: 0.72, stagger: 0.035 }, '-=0.58')
      .to(divider, { scaleX: 1, opacity: 0.6, duration: 1, ease: 'power2.inOut' }, '-=0.4');
  }

  function initSpineDraw() {
    const section = document.querySelector('.timeline-section');
    const line = document.querySelector('.timeline-spine-line');
    if (!section || !line) return;

    gsap.set(line, { scaleY: 0, transformOrigin: 'top center' });

    gsap.to(line, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        end: 'bottom 12%',
        scrub: isMobileViewport() ? 0.65 : 2,
        invalidateOnRefresh: true,
      },
    });
  }

  function rebuildTimelineOnResize() {
    ScrollTrigger.getAll().forEach((trigger) => {
      const id = trigger.vars?.id;
      if (typeof id === 'string' && id.startsWith('timeline-entry-')) {
        trigger.kill();
      }
    });

    const spineTween = gsap.getTweensOf('.timeline-spine-line').find(
      (tween) => tween.scrollTrigger,
    );
    if (spineTween?.scrollTrigger) {
      spineTween.scrollTrigger.kill();
    }

    initSpineDraw();
    initTimelineEntries();
    resetClosingReveal();
    refreshScrollTriggers(true);
  }

  function resetClosingReveal() {
    const closing = document.querySelector('.about-closing-inner');
    if (!closing) return;

    ScrollTrigger.getAll()
      .filter((st) => st.trigger === closing)
      .forEach((st) => st.kill());

    gsap.killTweensOf(closing.children);
    initClosingReveal();
  }

  function initTimelineEntries() {
    const entries = gsap.utils.toArray('.timeline-entry');
    if (!entries.length) return;

    timelineEntries.length = 0;

    entries.forEach((entry, index) => {
      const isLeft = entry.classList.contains('timeline-entry--left');
      const dot = entry.querySelector('.timeline-dot');
      const connector = entry.querySelector('.timeline-connector');
      const card = entry.querySelector('.timeline-card');
      const year = entry.querySelector('.timeline-year');
      const gif = entry.querySelector('.timeline-gif-container');

      if (!dot || !connector || !card || !year) return;

      timelineEntries.push(entry);

      const isMobile = isMobileViewport();
      const triggerId = `timeline-entry-${index}`;
      const animDuration = 1.35;
      const timelineScrub = 2.15;

      entry.dataset.timelineTriggerId = triggerId;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion || isMobile) {
        gsap.set(dot, { scale: 1 });
        gsap.set(connector, { scaleX: 1 });
        gsap.set(card, { x: 0, y: 0, opacity: 1 });
        gsap.set(year, { y: 0, opacity: 1 });
        if (gif) {
          gsap.set(gif, { x: 0, y: 0, scale: 1, opacity: 1, visibility: 'visible' });
          if (!reducedMotion) startGifFloat(gif);
        }
        return;
      }

      gsap.set(dot, { scale: 0, transformOrigin: 'center center' });
      gsap.set(connector, { scaleX: 0, transformOrigin: isLeft ? 'right center' : 'left center' });
      gsap.set(card, { x: isLeft ? -80 : 80, opacity: 0 });
      gsap.set(year, { y: 14, opacity: 0 });
      if (gif) {
        gsap.set(gif, {
          x: isLeft ? 80 : -80,
          y: 0,
          opacity: 1,
          visibility: 'visible',
        });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: triggerId,
          trigger: entry,
          start: 'top 94%',
          end: 'top 18%',
          scrub: timelineScrub,
          invalidateOnRefresh: true,
          onUpdate(self) {
            if (!gif) return;
            if (self.direction === -1 || self.progress < 0.9) stopGifFloat(gif);
            if (self.progress >= 0.9) startGifFloat(gif);
          },
        },
      });

      tl.to(dot, { scale: 1, duration: 0.65, ease: 'power2.out' })
        .to(connector, { scaleX: 1, duration: 0.55, ease: 'power2.out' }, '+=0.15')
        .to(card, { x: 0, opacity: 1, duration: animDuration, ease: 'power2.out' }, '+=0.2');

      if (gif) {
        tl.to(
          gif,
          {
            x: 0,
            y: 0,
            duration: animDuration,
            ease: 'power2.out',
          },
          '-=0.55',
        );
      }

      tl.to(year, { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out' }, '+=0.25');
    });
  }

  function initTimelineTextInertia() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const paragraphs = document.querySelectorAll('.about-page .timeline-card-body > p');
    if (!paragraphs.length) return;

    paragraphs.forEach((paragraph) => {
      if (paragraph.dataset.inertiaReady === 'true') return;

      const text = paragraph.textContent?.trim();
      if (!text) return;

      paragraph.textContent = '';
      paragraph.classList.add('timeline-inertia-line');
      paragraph.setAttribute('aria-label', text);
      paragraph.dataset.inertiaReady = 'true';

      const wordSpans = [];
      const words = text.split(/\s+/);
      const fragment = document.createDocumentFragment();

      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'timeline-inertia-word';
        span.textContent = word;
        fragment.appendChild(span);
        wordSpans.push(span);

        if (index < words.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      });

      paragraph.appendChild(fragment);

      const velocity = { x: 0, y: 0 };
      let lastPoint = null;

      paragraph.addEventListener('pointermove', (event) => {
        if (lastPoint) {
          velocity.x = event.clientX - lastPoint.x;
          velocity.y = event.clientY - lastPoint.y;
        }
        lastPoint = { x: event.clientX, y: event.clientY };
      });

      paragraph.addEventListener('pointerleave', () => {
        lastPoint = null;
        velocity.x = 0;
        velocity.y = 0;
        gsap.to(wordSpans, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.01,
        });
      });

      const kickStrength = isMobileViewport() ? 0.75 : 1;

      wordSpans.forEach((span, wordIndex) => {
        const activate = () => {
          const direction = wordIndex % 2 === 0 ? 1 : -1;
          const baseX = direction * (22 + Math.random() * 26) * kickStrength;
          const baseY = (Math.random() - 0.5) * 34 * kickStrength;
          const kickX =
            Math.abs(velocity.x) > 1 ? velocity.x * 1.35 + baseX * 0.35 : baseX;
          const kickY =
            Math.abs(velocity.y) > 1 ? velocity.y * 1.35 + baseY * 0.35 : baseY;

          gsap.to(span, {
            x: Math.max(-64, Math.min(64, kickX)),
            y: Math.max(-48, Math.min(48, kickY)),
            rotation: direction * (14 + Math.random() * 22) * kickStrength,
            scale: 1.04 + Math.random() * 0.1,
            duration: 0.38,
            ease: 'power3.out',
          });
        };

        span.addEventListener('pointerenter', activate);
        span.addEventListener('click', activate);
      });
    });
  }

  function initClosingReveal() {
    const closing = document.querySelector('.about-closing-inner');
    if (!closing) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobileViewport() || reducedMotion) {
      gsap.set(closing.children, { opacity: 1, y: 0, clearProps: 'transform' });
      return;
    }

    gsap.set(closing.children, { opacity: 0, y: 28 });

    const reveal = gsap.to(closing.children, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.18,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: closing,
        start: 'top 92%',
        end: 'top 22%',
        scrub: 2.15,
        invalidateOnRefresh: true,
      },
    });

    requestAnimationFrame(() => {
      if (reveal.scrollTrigger?.progress > 0.001) {
        reveal.progress(reveal.scrollTrigger.progress);
      }
    });
  }

  initTimelineGifLazyLoader();
  initHeroFade();
  initSpineDraw();
  initTimelineEntries();
  initTimelineTextInertia();
  initClosingReveal();
  refreshScrollTriggers(true);

  let resizeTimer;
  let lastMobileState = isMobileViewport();
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const mobileNow = isMobileViewport();
        if (mobileNow !== lastMobileState) {
          lastMobileState = mobileNow;
          rebuildTimelineOnResize();
          return;
        }
        refreshScrollTriggers(false);
      }, 150);
    },
    { passive: true },
  );

  window.addEventListener('load', () => refreshScrollTriggers(true), { once: true });
})();
