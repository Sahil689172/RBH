import { useEffect } from 'react';

export function useScrollReveal(selector = '.reveal-item') {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(selector);
    if (!items.length) return;

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

    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector]);
}
