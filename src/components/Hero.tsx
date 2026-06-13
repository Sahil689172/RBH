import { useEffect, useRef, useState } from 'react';
import { RevealLayer } from './RevealLayer';

const BG_IMAGE_1 = './i3.png';
const BG_IMAGE_2 = './i4.png';
const CURSOR_LERP = 0.055;
const CURSOR_LERP_TOUCH = 0.07;
const HEADLINE_WORDS = ['Walking', 'With', 'You'] as const;

function getSpotlightRadius(width: number): number {
  if (width < 768) return Math.min(Math.round(width * 0.46), 300);
  if (width < 1024) return Math.round(width * 0.38);
  return 480;
}

export function Hero() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const isMobileRef = useRef(false);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [spotlightR, setSpotlightR] = useState(480);

  useEffect(() => {
    const syncViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 768;
      isMobileRef.current = mobile;
      setSpotlightR(getSpotlightRadius(w));

      if (mobile) {
        const cx = w / 2;
        const cy = h * 0.64;
        mouse.current = { x: cx, y: cy };
        smooth.current = { x: cx, y: cy };
        setCursorPos({ x: cx, y: cy });
      }
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isMobileRef.current) return;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isMobileRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      mouse.current.x = touch.clientX;
      mouse.current.y = touch.clientY;
    };

    const tick = () => {
      const lerp = isMobileRef.current ? CURSOR_LERP_TOUCH : CURSOR_LERP;
      smooth.current.x += (mouse.current.x - smooth.current.x) * lerp;
      smooth.current.y += (mouse.current.y - smooth.current.y) * lerp;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const glowSize = Math.round(spotlightR * 1.14);

  return (
    <section
      className="relative w-full overflow-hidden h-screen bg-[#050505]"
      style={{ height: '100dvh' }}
    >
      <div className="absolute inset-0 z-10 hero-zoom">
        <div
          className="absolute inset-0 hero-image-layer hero-image-position"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />
        <div className="hero-image-grade" aria-hidden="true" />
        <div className="hero-image-bottom-blend" aria-hidden="true" />
      </div>

      <RevealLayer
        image={BG_IMAGE_2}
        cursorX={cursorPos.x}
        cursorY={cursorPos.y}
        spotlightR={spotlightR}
      />

      <div
        className="hero-spotlight-glow absolute inset-0 z-[35] pointer-events-none"
        style={{
          background: `radial-gradient(circle ${glowSize}px at ${cursorPos.x}px ${cursorPos.y}px, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.05) 36%, rgba(212,175,55,0.016) 56%, transparent 76%)`,
        }}
        aria-hidden="true"
      />

      <div className="hero-bottom-fade absolute bottom-0 left-0 right-0 h-40 z-40" aria-hidden="true" />

      <div className="absolute inset-x-0 top-0 z-50 flex flex-col items-center text-center px-5 pt-[4.5rem] sm:pt-[5rem] md:pt-[5.25rem]">
        <p
          className="hero-label-fade text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#D4AF37] mb-4 sm:mb-5 pointer-events-none"
          style={{ animationDelay: '0.15s' }}
        >
          ✦ RAHI BOOT HOUSE ✦
        </p>

        <h1 className="leading-[1.08] pointer-events-none">
          <span
            className="block font-playfair font-normal text-[#F5F5F5] text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem]"
            style={{ letterSpacing: '-0.02em' }}
          >
            {HEADLINE_WORDS.map((word, index) => (
              <span
                key={word}
                className="hero-word"
                style={{ animationDelay: `${0.38 + index * 0.14}s` }}
              >
                {word}
                {index < HEADLINE_WORDS.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </span>
          <span
            className="hero-slide-up block font-playfair italic font-normal text-[#D4AF37] text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem] mt-3 sm:mt-4"
            style={{ letterSpacing: '-0.01em', animationDelay: '0.92s' }}
          >
            Since 1959
          </span>
        </h1>

        <p
          className="hero-sub-fade mt-5 sm:mt-7 text-xs sm:text-sm text-[#A8A8A8] tracking-[0.04em] max-w-md pointer-events-none"
          style={{ animationDelay: '1.12s' }}
        >
          65 Years of Trusted Footwear
        </p>

        <div
          className="hero-btn-enter mt-8 sm:mt-10 mb-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          style={{ animationDelay: '1.32s' }}
        >
          <a
            href="/about/"
            className="hero-btn-lift bg-[#D4AF37] hover:bg-[#c4a030] text-[#050505] text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#D4AF37]/20 min-w-[200px] sm:min-w-0"
          >
            Explore Our Legacy
          </a>
          <a
            href="/contact/"
            className="hero-btn-lift border border-[#D4AF37]/45 text-[#F5F5F5] hover:bg-[#D4AF37]/10 text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 min-w-[200px] sm:min-w-0"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
