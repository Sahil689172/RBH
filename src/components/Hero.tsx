import { useEffect, useRef, useState } from 'react';
import { RevealLayer } from './RevealLayer';

const BG_IMAGE_1 = './i1.png';
const BG_IMAGE_2 = './i2.png';
const SPOTLIGHT_R = 460;
const CURSOR_LERP = 0.065;

export function Hero() {
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
      smooth.current.x += (mouse.current.x - smooth.current.x) * CURSOR_LERP;
      smooth.current.y += (mouse.current.y - smooth.current.y) * CURSOR_LERP;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const glowSize = Math.round(SPOTLIGHT_R * 1.12);

  return (
    <section
      className="relative w-full overflow-hidden h-screen bg-[#050505]"
      style={{ height: '100dvh' }}
    >
      <div className="absolute inset-0 z-10 hero-zoom">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-image-layer"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />
        <div className="hero-image-grade" aria-hidden="true" />
        <div className="hero-image-bottom-blend" aria-hidden="true" />
      </div>

      <RevealLayer
        image={BG_IMAGE_2}
        cursorX={cursorPos.x}
        cursorY={cursorPos.y}
        spotlightR={SPOTLIGHT_R}
      />

      <div
        className="hero-spotlight-glow absolute inset-0 z-[35] pointer-events-none"
        style={{
          background: `radial-gradient(circle ${glowSize}px at ${cursorPos.x}px ${cursorPos.y}px, rgba(212,175,55,0.11) 0%, rgba(212,175,55,0.055) 38%, rgba(212,175,55,0.018) 58%, transparent 78%)`,
        }}
        aria-hidden="true"
      />

      <div className="hero-bottom-fade absolute bottom-0 left-0 right-0 h-40 z-40" aria-hidden="true" />

      <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
        <h1 className="text-[#F5F5F5] leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Every Step,
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            A Statement.
          </span>
        </h1>
      </div>

      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade pointer-events-none"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="text-sm text-[#A8A8A8] leading-relaxed">
          Crafted for those who walk with purpose — our boots and shoes blend
          heritage craftsmanship with everyday durability, built for every
          terrain and occasion.
        </p>
      </div>

      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed">
          From rugged leather boots to sleek formal footwear, explore our curated
          collection at Rahi Boot House — where quality meets comfort at every
          step.
        </p>
        <a
          href="/collection/"
          className="bg-[#D4AF37] hover:bg-[#c4a030] text-[#050505] text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#D4AF37]/20"
        >
          Shop Collection
        </a>
      </div>
    </section>
  );
}
