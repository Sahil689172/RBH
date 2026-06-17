import { useEffect, useRef, useState } from 'react';
import { RevealLayer } from './RevealLayer';

const BG_IMAGE_1 = '/i3.png';
const BG_IMAGE_2 = '/i4.png';

type HeroProps = {
  className?: string;
};

export function Hero({ className = '' }: HeroProps) {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className={`min-h-screen bg-white tracking-[-0.02em]${className ? ` ${className}` : ''}`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <section
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
        aria-label="Rahi Boot House hero"
      >
        {/* Base image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat z-10 hero-zoom hero-bg-shift"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30"
            aria-hidden="true"
          />
        </div>

        {/* Reveal layer */}
        <RevealLayer
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
          className="hero-bg-shift"
        />

        {/* Text gradient — readability only */}
        <div className="hero-text-gradient" aria-hidden="true" />

        {/* Text — right luxury split */}
        <div className="hero-content-luxury">
          <p className="hero-lux-label hero-lux-anim-label">✦ RAHI BOOT HOUSE ✦</p>

          <h1 className="hero-lux-heading hero-lux-anim-headline" aria-label="Walking With You">
            Walking With&nbsp;You
          </h1>

          <p className="hero-lux-since hero-lux-anim-since">Since 1959</p>

          <p className="hero-lux-supporting hero-lux-anim-supporting">
            Three Generations of Trust
          </p>

          <div className="hero-lux-actions">
            <a href="/about/" className="hero-lux-btn-primary">
              Explore Our Legacy
            </a>
            <a href="/contact/" className="hero-lux-btn-secondary">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
