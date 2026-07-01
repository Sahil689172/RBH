import { useEffect } from 'react';

const MOBILE_HOME_BRANDS_REVEAL = '(max-width: 767px)';

export function useScrollReveal(selector = '.reveal-item') {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(selector);
    if (!items.length) return;

    const isMobile = window.matchMedia(MOBILE_HOME_BRANDS_REVEAL).matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    items.forEach((el) => {
      if (isMobile && el.closest('.home-brands-section')) return;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector]);
}
