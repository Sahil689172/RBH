/**
 * Rahi Boot House — Landing page interactions & animations
 * Uses GSAP (Framer Motion equivalent for this vanilla stack)
 * Does NOT touch scroll-driven canvas animation (script.js)
 */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const navLinkEls = document.querySelectorAll('.nav-link');
  const loader = document.getElementById('loader');

  /* ── Navbar scroll state ── */
  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ── Mobile menu ── */
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  navLinkEls.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Active nav link (scroll spy) ── */
  const sections = ['home', 'about', 'brands', 'collection', 'contact'];

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => setActiveNav(id),
      onEnterBack: () => setActiveNav(id),
    });
  });

  function setActiveNav(id) {
    navLinkEls.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === id);
    });
  }

  /* ── Hero word-by-word reveal ── */
  function initHeroAnimations() {
    const words = document.querySelectorAll('.hero-title .word');
    const revealItems = document.querySelectorAll('.hero-support, .hero-actions');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.09,
    })
      .to(
        revealItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
        },
        '-=0.35'
      );
  }

  /* ── Scroll reveal for sections ── */
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

  /* ── Animated counters ── */
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

  /* ── Scroll hint fade during shoe animation ── */
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

  /* ── Subtle particle field ── */
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

  /* ── Boot after loader finishes ── */
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
