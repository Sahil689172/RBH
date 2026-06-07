/**
 * Contact page — animations & form handling
 */

(function () {
  'use strict';

  const page = document.querySelector('.contact-page');
  if (!page) return;

  function initForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#contact-name').value.trim();
      const phone = form.querySelector('#contact-phone').value.trim();
      const message = form.querySelector('#contact-message').value.trim();

      if (!name || !phone || !message) {
        feedback.textContent = 'Please fill in all fields.';
        feedback.className = 'form-feedback form-feedback--error';
        return;
      }

      const waText = encodeURIComponent(
        `Hello Rahi Boot House,\n\nName: ${name}\nPhone: ${phone}\n\n${message}`
      );
      window.open(`https://wa.me/919826270611?text=${waText}`, '_blank', 'noopener,noreferrer');

      feedback.textContent = 'Opening WhatsApp to send your enquiry…';
      feedback.className = 'form-feedback form-feedback--success';
      form.reset();
    });
  }

  initForm();

  if (typeof gsap === 'undefined') {
    return;
  }

  document.querySelector('.contact-page').classList.add('js-ready');

  gsap.registerPlugin(ScrollTrigger);

  function initHeroFade() {
    gsap.set(['.contact-hero-label', '.page-hero-title', '.page-hero-sub'], {
      opacity: 0,
      y: 20,
    });

    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .to('.contact-hero-label', { opacity: 1, y: 0, duration: 0.65 })
      .to('.page-hero-title', { opacity: 1, y: 0, duration: 0.75 }, '-=0.35')
      .to('.page-hero-sub', { opacity: 1, y: 0, duration: 0.7 }, '-=0.45');
  }

  function initScrollReveals() {
    const cardEls = gsap.utils.toArray('.contact-cards .reveal-item');
    if (cardEls.length) {
      gsap.to(cardEls, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.contact-cards',
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    }

    gsap.utils.toArray('.contact-page .reveal-item').forEach((el) => {
      if (el.closest('.contact-cards')) return;

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

  initHeroFade();
  initScrollReveals();
  ScrollTrigger.refresh();
})();
