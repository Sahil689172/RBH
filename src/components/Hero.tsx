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

        {/* Text — upper 35% only */}
        <div
          className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center justify-end text-center px-5 pointer-events-none"
          style={{
            height: '35%',
            paddingTop: 'calc(var(--nav-height, 84px) + 0.25rem)',
            paddingBottom: 'clamp(0.5rem, 2vh, 1.25rem)',
          }}
        >
          <p
            className="hero-label-fade text-[0.65rem] sm:text-xs tracking-[0.38em] uppercase text-white/65"
            style={{ animationDelay: '0.15s' }}
          >
            ✦ RAHI BOOT HOUSE ✦
          </p>

          <h1
            className="hero-headline-reveal font-cormorant font-medium text-[#F5F5F5] text-4xl sm:text-5xl md:text-6xl leading-[1.05] mt-3 sm:mt-4"
            style={{ animationDelay: '0.3s', letterSpacing: '-0.02em' }}
          >
            Walking With You
          </h1>

          <p
            className="hero-slide-up font-cormorant italic text-[#D4AF37] text-xl sm:text-2xl md:text-[1.65rem] mt-1 sm:mt-1.5"
            style={{ animationDelay: '0.5s' }}
          >
            Since 1959
          </p>

          <p
            className="hero-slide-up text-sm sm:text-base text-white/85 tracking-[0.06em] mt-2 sm:mt-3"
            style={{ animationDelay: '0.65s' }}
          >
            Three Generations of Trust
          </p>

          <p
            className="hero-sub-fade text-xs sm:text-sm text-white/60 max-w-sm mt-2 sm:mt-3 leading-relaxed"
            style={{ animationDelay: '0.8s' }}
          >
            Serving generations of families with trusted footwear and leading brands
            since 1959.
          </p>

          <div
            className="hero-btn-enter flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-7 sm:mt-8 pointer-events-auto"
            style={{ animationDelay: '1s' }}
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
