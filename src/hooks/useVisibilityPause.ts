import { useEffect, type RefObject } from 'react';

/**
 * Pauses CSS animations on `target` while it is off-screen to avoid wasted compositor work.
 */
export function useVisibilityPause(
  containerRef: RefObject<HTMLElement | null>,
  targetSelector?: string,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const target =
      (targetSelector ? container.querySelector<HTMLElement>(targetSelector) : null) ??
      container;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      },
      { threshold: 0, rootMargin: '48px 0px' },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, targetSelector]);
}
