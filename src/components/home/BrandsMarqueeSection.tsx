import { Fragment, useEffect, useRef } from 'react';

const BRANDS = [
  'Campus',
  'Liberty',
  'Paragon',
  'Adda',
  'Welcome',
  'Aerowalk',
  'GND',
  'Red Chief',
  'Mocs',
  'Kats',
  'Bata',
  'Abros',
  'Glamour',
  'Frankie',
  'Lee Cooper',
] as const;

function MarqueeRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="home-marquee-row" aria-hidden={hidden}>
      {BRANDS.map((brand) => (
        <Fragment key={`${hidden ? 'dup-' : ''}${brand}`}>
          <span className="home-brand-name">{brand}</span>
          <span className="home-brand-sep">✦</span>
        </Fragment>
      ))}
    </div>
  );
}

export function BrandsMarqueeSection() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const track = wrap.querySelector<HTMLElement>('.home-marquee-track');
    if (!track) return;

    const pause = () => {
      track.style.animationPlayState = 'paused';
    };

    const resume = () => {
      track.style.animationPlayState = 'running';
    };

    wrap.addEventListener('touchstart', pause, { passive: true });
    wrap.addEventListener('touchend', resume, { passive: true });
    wrap.addEventListener('touchcancel', resume, { passive: true });

    return () => {
      wrap.removeEventListener('touchstart', pause);
      wrap.removeEventListener('touchend', resume);
      wrap.removeEventListener('touchcancel', resume);
    };
  }, []);

  return (
    <section className="home-brands-section" aria-labelledby="home-brands-title">
      <div className="home-section-header reveal-item">
        <span className="home-section-label">✦ TRUSTED FOOTWEAR BRANDS ✦</span>
        <h2 id="home-brands-title" className="home-section-title">
          Brands We Deal In
        </h2>
      </div>

      <div ref={wrapRef} className="home-marquee-wrap" aria-label="Partner brands">
        <div className="home-marquee-track">
          <MarqueeRow />
          <MarqueeRow hidden />
        </div>
      </div>
    </section>
  );
}
