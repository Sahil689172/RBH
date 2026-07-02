import '../../home-sections.css';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { BrandsMarqueeSection } from './BrandsMarqueeSection';

const TestimonialsSection = lazy(() =>
  import('./TestimonialsSection').then((module) => ({
    default: module.TestimonialsSection,
  })),
);

const TrustStatementSection = lazy(() =>
  import('./TrustStatementSection').then((module) => ({
    default: module.TrustStatementSection,
  })),
);

function LazyBelowFoldSections() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px 240px 0px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="home-below-fold-sentinel" aria-hidden="true" />
      {shouldMount ? (
        <Suspense fallback={null}>
          <TestimonialsSection />
          <TrustStatementSection />
        </Suspense>
      ) : null}
    </>
  );
}

export function HomeSections() {
  useScrollReveal();

  return (
    <main className="site-main">
      <BrandsMarqueeSection />
      <LazyBelowFoldSections />
    </main>
  );
}
