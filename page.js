/**
 * Placeholder subpage fade-in
 */

(function () {
  'use strict';

  const page = document.querySelector('.placeholder-page');
  if (!page) return;

  requestAnimationFrame(() => {
    page.classList.add('visible');
  });
})();
