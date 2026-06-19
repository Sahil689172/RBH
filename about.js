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
    gsap.killTweensOf(gifEl);
    gsap.set(gifEl, { y: 0 });
  }

  function startGifFloat(gifEl) {
    if (!gifEl) return;
    stopGifFloat(gifEl);

    gsap.to(gifEl, {
      y: isMobileViewport() ? -4 : -8,
      duration: isMobileViewport() ? 3.5 : 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  function preloadTimelineGifs() {
    TIMELINE_GIFS.forEach((name, index) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = index < 2 ? 'eager' : 'lazy';
      img.src = `../public2/${name}`;
    });

    document.querySelectorAll('.timeline-gif-container img').forEach((img) => {
      if (img.dataset.fallbackReady === 'true') return;
      img.dataset.fallbackReady = 'true';

      img.addEventListener('error', () => {
        const entry = img.closest('.timeline-entry');
        const src = entry?.dataset.gif;
        if (src && img.src !== new URL(src, window.location.href).href) {
          img.src = src;
        }
      });
    });
  }

  function syncInitialTimelineState() {
    timelineEntries.forEach((entry) => {
      const trigger = ScrollTrigger.getById(entry.dataset.timelineTriggerId);
      const anim = trigger?.animation;
      const gif = entry.querySelector('.timeline-gif-container');
      if (!trigger || !anim) return;

      if (trigger.isActive) {
        anim.progress(1);
        if (gif) startGifFloat(gif);
      } else {
        anim.progress(0);
        if (gif) stopGifFloat(gif);
      }
    });
  }

  function refreshScrollTriggers(runInitialSync) {
    ScrollTrigger.refresh(true);

    if (runInitialSync) {
      requestAnimationFrame(() => {
        syncInitialTimelineState();
      });
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
        start: 'top 70%',
        end: 'bottom 85%',
        scrub: isMobileViewport() ? 0.6 : 1,
        invalidateOnRefresh: true,
      },
    });
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
      const xFrom = isMobile || isLeft ? -80 : 80;
      const connectorOrigin = isMobile || !isLeft ? 'left center' : 'right center';
      const gifXFrom = isMobile ? 0 : isLeft ? 80 : -80;
      const gifYFrom = isMobile ? 36 : 0;
      const triggerId = `timeline-entry-${index}`;
      const animDuration = isMobile ? 0.75 : 0.9;

      entry.dataset.timelineTriggerId = triggerId;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        gsap.set(dot, { scale: 1 });
        gsap.set(connector, { scaleX: 1 });
        gsap.set(card, { x: 0, opacity: 1 });
        gsap.set(year, { y: 0, opacity: 1 });
        if (gif) {
          gsap.set(gif, { x: 0, y: 0, opacity: 1, visibility: 'visible' });
          startGifFloat(gif);
        }
        return;
      }

      gsap.set(dot, { scale: 0, transformOrigin: 'center center' });
      gsap.set(connector, { scaleX: 0, transformOrigin: connectorOrigin });
      gsap.set(card, { x: xFrom, opacity: 0 });
      gsap.set(year, { y: 14, opacity: 0 });

      if (gif) {
        gsap.set(gif, {
          x: gifXFrom,
          y: gifYFrom,
          opacity: 1,
          visibility: 'visible',
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          id: triggerId,
          trigger: entry,
          start: 'top 88%',
          end: 'bottom 12%',
          toggleActions: 'play reverse play reverse',
          invalidateOnRefresh: true,
          onEnter: () => {
            if (gif) startGifFloat(gif);
          },
          onLeave: () => stopGifFloat(gif),
          onLeaveBack: () => stopGifFloat(gif),
          onEnterBack: () => {
            if (gif) startGifFloat(gif);
          },
        },
      });

      tl.to(dot, { scale: 1, duration: 0.5, ease: 'power3.out' })
        .to(connector, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, '+=0.1')
        .to(card, { x: 0, opacity: 1, duration: animDuration, ease: 'power3.out' }, '+=0.1');

      if (gif) {
        tl.to(
          gif,
          {
            x: 0,
            y: 0,
            duration: animDuration,
            ease: 'power3.out',
            onComplete: () => startGifFloat(gif),
            onReverseComplete: () => stopGifFloat(gif),
          },
          '-=0.75',
        );
      }

      tl.to(year, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '+=0.1');

      if (TIMELINE_GIFS[index] && entry.dataset.gif) {
        if (!entry.dataset.gif.endsWith(TIMELINE_GIFS[index])) {
          console.warn(`Timeline entry ${index + 1}: expected GIF ${TIMELINE_GIFS[index]}`);
        }
      }
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

    gsap.set(closing.children, { opacity: 0, y: 24 });

    gsap.to(closing.children, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: closing,
        start: 'top 88%',
        end: 'bottom 12%',
        toggleActions: 'play reverse play reverse',
      },
    });
  }

  preloadTimelineGifs();
  initHeroFade();
  initSpineDraw();
  initTimelineEntries();
  initTimelineTextInertia();
  initClosingReveal();
  refreshScrollTriggers(true);

  let resizeTimer;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => refreshScrollTriggers(false), 150);
    },
    { passive: true },
  );

  window.addEventListener('load', () => refreshScrollTriggers(true), { once: true });
})();
