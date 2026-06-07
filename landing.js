/**
 * Rahi Boot House — Homepage animations
 * Shoe scroll animation lives in script.js (unchanged logic aside from Y offset)
 */

(function () {
  'use strict';

  if (!document.getElementById('loader')) return;

  gsap.registerPlugin(ScrollTrigger);

  const loader = document.getElementById('loader');

  function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-label', {
      opacity: 0,
      y: 16,
      duration: 0.7,
    })
      .from(
        '.hero-heading, .hero-year',
        { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 },
        '-=0.4'
      )
      .from(
        '.reveal-hero:not(.hero-label)',
        { opacity: 0, y: 18, duration: 0.7, stagger: 0.12 },
        '-=0.25'
      );
  }

  function initScrollReveals() {
    gsap.utils.toArray('.reveal-item').forEach((el) => {
      if (el.closest('.cinematic-hero')) return;

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

  function initScrollHint() {
    const hint = document.querySelector('.scroll-hint');
    const hero = document.getElementById('hero');
    if (!hint || !hero) return;

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=800',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(hint, { opacity: Math.max(0, 1 - self.progress * 1.5) });
      },
    });
  }

  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h, raf;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((w * h) / 18000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.3,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          a: Math.random() * 0.4 + 0.1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    window.addEventListener('beforeunload', () => cancelAnimationFrame(raf));
  }

  function bootLanding() {
    initHeroAnimations();
    initScrollReveals();
    initCounters();
    initScrollHint();
    initParticles();
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
