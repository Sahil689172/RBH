import { Fragment } from 'react';

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
  return (
    <section className="home-brands-section" aria-labelledby="home-brands-title">
      <div className="home-section-header reveal-item">
        <span className="home-section-label">✦ TRUSTED FOOTWEAR BRANDS ✦</span>
        <h2 id="home-brands-title" className="home-section-title">
          Brands We Deal In
        </h2>
      </div>

      <div className="home-marquee-wrap" aria-label="Partner brands">
        <div className="home-marquee-track">
          <MarqueeRow />
          <MarqueeRow hidden />
        </div>
      </div>
    </section>
  );
}
