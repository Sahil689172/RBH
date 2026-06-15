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

        {/* Text */}
        <div
          className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none"
          style={{ paddingTop: 'calc(var(--nav-height, 84px) + 1.25rem)' }}
        >
          <p className="hero-type-label hero-label-fade" style={{ animationDelay: '0.1s' }}>
            ✦ RAHI BOOT HOUSE ✦
          </p>

          <h1
            className="hero-type-headline hero-headline-reveal mt-6"
            style={{ animationDelay: '0.2s' }}
          >
            Walking With You
          </h1>

          <p
            className="hero-type-accent hero-slide-up mt-[18px]"
            style={{ animationDelay: '0.35s' }}
          >
            Since 1959
          </p>

          <p
            className="hero-type-desc hero-sub-fade mt-7 px-2"
            style={{ animationDelay: '0.5s' }}
          >
            Serving generations of families with trusted footwear and leading brands
            since 1959.
          </p>

          <div
            className="hero-btn-enter flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-9 pointer-events-auto"
            style={{ animationDelay: '0.65s' }}
          >
            <a
              href="/about/"
              className="hero-btn-lift inline-flex items-center justify-center bg-[#D4AF37] hover:bg-[#e0bc4a] text-[#050505] text-sm font-medium tracking-[0.04em] px-7 py-3 rounded-full"
            >
              Explore Our Legacy
            </a>
            <a
              href="/contact/"
              className="hero-btn-lift inline-flex items-center justify-center bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-sm font-medium tracking-[0.04em] px-7 py-3 rounded-full"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
