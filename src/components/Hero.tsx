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
          className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat z-10 hero-zoom"
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
        />

        {/* Text gradient — readability only */}
        <div className="hero-text-gradient" aria-hidden="true" />

        {/* Text — left luxury split */}
        <div className="hero-content-luxury">
          <p className="hero-lux-est">EST. 1959</p>

          <h1 className="hero-lux-heading" aria-label="Walking With You">
            <span className="hero-lux-word" style={{ animationDelay: '0.15s' }}>
              Walking
            </span>
            <span className="hero-lux-word" style={{ animationDelay: '0.3s' }}>
              With You
            </span>
          </h1>

          <p className="hero-lux-subtitle">
            Premium footwear for generations.
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
