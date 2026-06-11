/**
 * Rahi Boot House — Homepage section animations (below hero)
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (!document.querySelector('.reveal-item')) return;

  gsap.registerPlugin(ScrollTrigger);

  function initScrollReveals() {
    gsap.utils.toArray('.reveal-item').forEach((el) => {
      if (el.closest('#hero-scroll-section') || el.closest('#hero-cta')) return;

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  function initCounters() {
    document.querySelectorAll('.trust-number').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              const n = Math.round(obj.val);
              el.textContent =
                n >= 1000 ? n.toLocaleString('en-IN') + suffix : n + suffix;
            },
          });
        },
      });
    });
  }

  function bootLanding() {
    initScrollReveals();
    initCounters();
    setTimeout(() => ScrollTrigger.refresh(), 300);
  }

  const loader = document.getElementById('loader');

  if (loader) {
    const observer = new MutationObserver(() => {
      if (loader.classList.contains('hidden')) {
        observer.disconnect();
        bootLanding();
      }
    });

    observer.observe(loader, { attributes: true, attributeFilter: ['class'] });

    if (loader.classList.contains('hidden')) {
      bootLanding();
    }
    return;
  }

  function tryBoot() {
    if (!document.querySelector('.reveal-item')) return false;
    bootLanding();
    return true;
  }

  function scheduleBoot() {
    if (tryBoot()) return;

    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(() => {
      if (tryBoot()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBoot);
  } else {
    scheduleBoot();
  }
})();
