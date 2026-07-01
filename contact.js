/**
 * Contact page — animations
 */

(function () {
  'use strict';

  const page = document.querySelector('.contact-page');
  if (!page) return;

  function initHeroHoverText() {
    const lines = document.querySelectorAll('.contact-hero-hover-text[data-hover-text]');
    if (!lines.length) return;

    lines.forEach((line) => {
      const text = line.textContent?.trim() ?? '';
      if (!text) return;

      line.textContent = '';
      line.setAttribute('aria-label', text);
      line.setAttribute('tabindex', '0');

      const chars = [...text].map((char) => {
        const span = document.createElement('span');
        span.className = 'contact-hero-char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        line.appendChild(span);
        return span;
      });

      const scatter = () => {
        if (typeof gsap === 'undefined') return;
        chars.forEach((span, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          gsap.to(span, {
            x: direction * (8 + Math.random() * 22),
            y: (Math.random() - 0.5) * 28,
            rotation: direction * (6 + Math.random() * 18),
            scale: 0.92 + Math.random() * 0.2,
            duration: 0.45,
            ease: 'power3.out',
            delay: index * 0.012,
          });
        });
      };

      const reset = () => {
        if (typeof gsap === 'undefined') return;
        gsap.to(chars, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.008,
        });
      };

      line.addEventListener('mouseenter', scatter);
      line.addEventListener('mouseleave', reset);
      line.addEventListener('focusin', scatter);
      line.addEventListener('focusout', reset);
    });
  }

  initHeroHoverText();

  if (typeof gsap === 'undefined') {
    return;
  }

  document.querySelector('.contact-page').classList.add('js-ready');

  gsap.registerPlugin(ScrollTrigger);

  function initScrollReveals() {
    const cardEls = gsap.utils.toArray('.contact-details-grid .reveal-item');
    if (cardEls.length) {
      gsap.to(cardEls, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.contact-details-grid',
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    }

    gsap.utils.toArray('.contact-page .reveal-item').forEach((el) => {
      if (el.closest('.contact-details-grid')) return;

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  initScrollReveals();
  ScrollTrigger.refresh();
})();
