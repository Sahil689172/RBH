/**
 * Shared site behavior — navbar, call dropdown, active nav
 */

(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  const MOBILE_NAV_MQ = window.matchMedia('(max-width: 768px)');

  function isMobileNav() {
    return MOBILE_NAV_MQ.matches;
  }

  function initTubelightNav() {
    const track = document.getElementById('tubelight-nav-track');
    const lamp = document.getElementById('tubelight-lamp');
    if (!track || !lamp || isMobileNav()) return;

    const items = track.querySelectorAll('.tubelight-nav-item[data-nav]');

    function moveLamp(target) {
      if (!target || isMobileNav()) return;
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
      if (isMobileNav()) {
        lamp.style.width = '';
        lamp.style.transform = '';
        return;
      }
      moveLamp(track.querySelector('.tubelight-nav-item.active'));
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!isMobileNav()) {
          moveLamp(track.querySelector('.tubelight-nav-item.active'));
        }
      });
    }
  }

  function setBodyScrollLocked(locked) {
    document.body.classList.toggle('nav-menu-open', locked);
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  function ensureMobileNavBackdrop() {
    let backdrop = document.getElementById('mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mobile-nav-backdrop';
      backdrop.className = 'mobile-nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
    }
    return backdrop;
  }

  function positionMobileNav(navLinks, backdrop) {
    const navbarInner = document.querySelector('.navbar-inner');
    const navbarActions = document.querySelector('.navbar-actions');
    if (!navLinks || !navbarInner || !navbarActions) return;

    if (isMobileNav()) {
      if (backdrop.parentNode !== document.body) {
        document.body.appendChild(backdrop);
      }
      if (navLinks.parentNode !== document.body) {
        document.body.appendChild(navLinks);
      }
      return;
    }

    if (navLinks.parentNode === document.body) {
      navbarInner.insertBefore(navLinks, navbarActions);
    }

    navLinks.classList.remove('open');
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');

    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    setBodyScrollLocked(false);
  }

  if (navbar) {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navLinkEls = document.querySelectorAll('.nav-link[data-nav]');
    const currentPage = document.body.dataset.page || 'home';
    const mobileNavBackdrop = ensureMobileNavBackdrop();

    navLinkEls.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === currentPage);
    });

    initTubelightNav();
    positionMobileNav(navLinks, mobileNavBackdrop);
    MOBILE_NAV_MQ.addEventListener('change', () => {
      initTubelightNav();
      positionMobileNav(navLinks, mobileNavBackdrop);
    });

    function updateNavbar() {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    if (hamburger && navLinks) {
      const setMenuOpen = (open) => {
        if (!isMobileNav()) return;

        navLinks.classList.toggle('open', open);
        mobileNavBackdrop.classList.toggle('open', open);
        mobileNavBackdrop.setAttribute('aria-hidden', String(!open));
        navLinks.setAttribute('aria-hidden', String(!open));
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        setBodyScrollLocked(open);
      };

      hamburger.addEventListener('click', () => {
        setMenuOpen(!navLinks.classList.contains('open'));
      });

      navLinkEls.forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
      });

      mobileNavBackdrop.addEventListener('click', () => setMenuOpen(false));

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
