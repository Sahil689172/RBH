/**
 * About page — hero fade & timeline ScrollTrigger animations
 */

(function () {
  'use strict';

  const page = document.querySelector('.about-page');
  if (!page) return;

  if (typeof gsap === 'undefined') {
    return;
  }

  page.classList.add('js-ready');
  gsap.registerPlugin(ScrollTrigger);

  function initHeroFade() {
    gsap.set(['.about-hero-label', '.about-hero .page-hero-title', '.about-hero .page-hero-sub'], {
      opacity: 0,
      y: 20,
    });

    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .to('.about-hero-label', { opacity: 1, y: 0, duration: 0.65 })
      .to('.about-hero .page-hero-title', { opacity: 1, y: 0, duration: 0.75 }, '-=0.35')
      .to('.about-hero .page-hero-sub', { opacity: 1, y: 0, duration: 0.7 }, '-=0.45');
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
        scrub: 1,
      },
    });
  }

  function initTimelineEntries() {
    const entries = gsap.utils.toArray('.timeline-entry');
    if (!entries.length) return;

    entries.forEach((entry) => {
      const isLeft = entry.classList.contains('timeline-entry--left');
      const dot = entry.querySelector('.timeline-dot');
      const connector = entry.querySelector('.timeline-connector');
      const card = entry.querySelector('.timeline-card');
      const year = entry.querySelector('.timeline-year');

      if (!dot || !connector || !card || !year) return;

      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const xFrom = isMobile || isLeft ? -80 : 80;
      const connectorOrigin = isMobile || !isLeft ? 'left center' : 'right center';

      gsap.set(dot, { scale: 0, transformOrigin: 'center center' });
      gsap.set(connector, { scaleX: 0, transformOrigin: connectorOrigin });
      gsap.set(card, { x: xFrom, opacity: 0 });
      gsap.set(year, { y: 14, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: entry,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.to(dot, { scale: 1, duration: 0.5, ease: 'power3.out' })
        .to(connector, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, '+=0.1')
        .to(card, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '+=0.1')
        .to(year, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '+=0.1');
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
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  initHeroFade();
  initSpineDraw();
  initTimelineEntries();
  initClosingReveal();
  ScrollTrigger.refresh();
})();
