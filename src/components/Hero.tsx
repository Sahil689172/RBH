import { useEffect, useRef, useState } from 'react';
import { RevealLayer } from './RevealLayer';

const BG_IMAGE_1 = '/i3.png';
const BG_IMAGE_2 = '/i4.png';
const CURSOR_LERP = 0.048;
const CURSOR_LERP_TOUCH = 0.062;

function getSpotlightRadius(width: number): number {
  if (width < 768) return Math.min(Math.round(width * 0.52), 360);
  if (width < 1024) return Math.round(width * 0.44);
  return 560;
}

export function Hero() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const isMobileRef = useRef(false);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [spotlightR, setSpotlightR] = useState(560);

  useEffect(() => {
    const syncViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 768;
      isMobileRef.current = mobile;
      setSpotlightR(getSpotlightRadius(w));

      if (mobile) {
        const cx = w / 2;
        const cy = h * 0.55;
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
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
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

  const glowSize = Math.round(spotlightR * 1.16);

  return (
    <section
      className="hero-luxury relative w-full overflow-hidden bg-[#050505]"
      style={{ height: '100dvh' }}
    >
      <div className="hero-marquee" aria-hidden="true">
        <span className="hero-marquee-text">RAHI BOOT HOUSE</span>
      </div>

      {/* Layer 2 — full-bleed hero image + reveal (unchanged) */}
      <div className="hero-image-layer absolute inset-0 z-[1]">
        <div
          className="hero-full-bg hero-image-base absolute inset-0"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
          aria-hidden="true"
        />

        <div className="hero-image-grade absolute inset-0 z-[15] pointer-events-none" aria-hidden="true" />

        <RevealLayer
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
          spotlightR={spotlightR}
        />

        <div
          className="hero-spotlight-glow absolute inset-0 z-[35] pointer-events-none"
          style={{
            background: `radial-gradient(circle ${glowSize}px at ${cursorPos.x}px ${cursorPos.y}px, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 34%, rgba(212,175,55,0.02) 58%, transparent 78%)`,
          }}
          aria-hidden="true"
        />
      </div>

      <div className="hero-text-scrim absolute inset-x-0 top-0 z-[2] pointer-events-none" aria-hidden="true" />

      {/* Layer 1 — hero content (upper viewport) */}
      <div className="hero-content-layer absolute inset-x-0 top-0">
        <div className="hero-content-wrap">
          <p
            className="hero-label-fade text-[9px] sm:text-[10px] uppercase tracking-[0.38em] text-[#D4AF37] mb-3 sm:mb-4"
            style={{ animationDelay: '0.1s' }}
          >
            ✦ RAHI BOOT HOUSE ✦
          </p>

          <h1 className="font-display w-full">
            <span
              className="hero-headline-text hero-headline-reveal block"
              style={{ animationDelay: '0.28s' }}
            >
              Walking With You
            </span>
            <span
              className="hero-since-text hero-slide-up block"
              style={{ animationDelay: '0.62s' }}
            >
              Since 1959
            </span>
          </h1>

          <p
            className="hero-desc-text hero-sub-fade leading-relaxed"
            style={{ animationDelay: '0.82s' }}
          >
            Discover premium footwear for every step.
          </p>

          <div
            className="hero-btn-enter mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            style={{ animationDelay: '1.02s' }}
          >
            <a
              href="/about/"
              className="hero-btn-lift bg-[#D4AF37] hover:bg-[#c4a030] text-[#050505] text-sm font-medium px-8 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-[#D4AF37]/25 min-w-[210px] sm:min-w-0"
            >
              Explore Our Legacy
            </a>
            <a
              href="/contact/"
              className="hero-btn-lift border border-[#D4AF37] bg-transparent text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050505] text-sm font-medium px-8 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] min-w-[210px] sm:min-w-0"
            >
              Contact Us
            </a>
          </div>

          <div className="hero-content-gap" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
