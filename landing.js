/**
 * Rahi Boot House — Homepage section animations (below hero story)
 */

(function () {
  'use strict';

  if (!document.getElementById('loader')) return;

  gsap.registerPlugin(ScrollTrigger);

  const loader = document.getElementById('loader');

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
})();
