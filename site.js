/**
 * Shared site behavior — navbar, call dropdown, active nav
 */

(function () {
  'use strict';

  const navbar = document.getElementById('navbar');

  if (navbar) {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navLinkEls = document.querySelectorAll('.nav-link[data-nav]');
    const currentPage = document.body.dataset.page || 'home';

    navLinkEls.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === currentPage);
    });

    function updateNavbar() {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    if (hamburger && navLinks) {
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
    }
  }

  function closeAllCallMenus() {
    document.querySelectorAll('.call-menu.open').forEach((menu) => {
      menu.classList.remove('open');
      const dropdown = menu.closest('.call-dropdown');
      const trigger = dropdown && dropdown.querySelector('.call-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  document.querySelectorAll('.call-dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.call-trigger');
    const menu = dropdown.querySelector('.call-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');
      closeAllCallMenus();
      if (!isOpen) {
        menu.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', closeAllCallMenus);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllCallMenus();
  });
})();
