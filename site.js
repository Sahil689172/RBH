/**
 * Shared site behavior — navbar, call dropdown, active nav
 */

(function () {
  'use strict';

  const navbar = document.getElementById('navbar');

  function initTubelightNav() {
    const track = document.getElementById('tubelight-nav-track');
    const lamp = document.getElementById('tubelight-lamp');
    if (!track || !lamp) return;

    const items = track.querySelectorAll('.tubelight-nav-item[data-nav]');

    function moveLamp(target) {
      if (!target) return;
      const trackRect = track.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      lamp.style.width = `${rect.width}px`;
      lamp.style.transform = `translateX(${rect.left - trackRect.left}px)`;
    }

    function setActive(nav) {
      items.forEach((item) => {
        item.classList.toggle('active', item.dataset.nav === nav);
      });
      moveLamp(track.querySelector('.tubelight-nav-item.active'));
    }

    const currentPage = document.body.dataset.page || 'home';
    setActive(currentPage);

    items.forEach((item) => {
      item.addEventListener('click', () => setActive(item.dataset.nav));
    });

    window.addEventListener('resize', () => {
      moveLamp(track.querySelector('.tubelight-nav-item.active'));
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => moveLamp(track.querySelector('.tubelight-nav-item.active')));
    }
  }

  if (navbar) {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navLinkEls = document.querySelectorAll('.nav-link[data-nav]');
    const currentPage = document.body.dataset.page || 'home';

    navLinkEls.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === currentPage);
    });

    initTubelightNav();

    function updateNavbar() {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    if (hamburger && navLinks) {
      const setMenuOpen = (open) => {
        navLinks.classList.toggle('open', open);
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('nav-menu-open', open);
      };

      hamburger.addEventListener('click', () => {
        setMenuOpen(!navLinks.classList.contains('open'));
      });

      navLinkEls.forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
          setMenuOpen(false);
        }
      });

      navLinks.addEventListener('click', (e) => {
        if (e.target === navLinks) {
          setMenuOpen(false);
        }
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
