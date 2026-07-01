const SHOE_IMAGES = Array.from({ length: 9 }, (_, index) => ({
  src: `/public3/s${index}.png`,
  alt: `Footwear style ${index + 1}`,
}));

function ShoeLoopRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="hero-mobile-shoe-loop__row" aria-hidden={hidden}>
      {SHOE_IMAGES.map((shoe) => (
        <article key={`${hidden ? 'dup-' : ''}${shoe.src}`} className="hero-mobile-shoe-loop__card">
          <img src={shoe.src} alt={hidden ? '' : shoe.alt} loading="lazy" decoding="async" />
        </article>
      ))}
    </div>
  );
}

export function MobileHeroShoeLoop() {
  return (
    <div className="hero-mobile-shoe-loop" aria-hidden="true">
      <div className="hero-mobile-shoe-loop__track">
        <ShoeLoopRow />
        <ShoeLoopRow hidden />
      </div>
    </div>
  );
}
