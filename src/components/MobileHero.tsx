import { useEffect, useRef, useState } from 'react';
import { MobileShoeReveal } from './MobileShoeReveal';

type MobileHeroProps = {
  className?: string;
};

export function MobileHero({ className = '' }: MobileHeroProps) {
  const shoeWrapRef = useRef<HTMLDivElement>(null);
  const touchActive = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [revealPos, setRevealPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const wrap = shoeWrapRef.current;
    if (!wrap) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setFromClient = (clientX: number, clientY: number) => {
      const visual = wrap.querySelector<HTMLElement>('.hero-mobile-shoe-visual');
      if (!visual) return;

      const rect = visual.getBoundingClientRect();
      pointer.current.x = clientX - rect.left;
      pointer.current.y = clientY - rect.top;
    };

    const onTouchStart = (e: TouchEvent) => {
      touchActive.current = true;
      const touch = e.touches[0];
      if (touch) setFromClient(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      touchActive.current = true;
      const touch = e.touches[0];
      if (touch) setFromClient(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => {
      touchActive.current = false;
    };

    const tick = () => {
      if (!touchActive.current && !reducedMotion) {
        const visual = wrap.querySelector<HTMLElement>('.hero-mobile-shoe-visual');
        if (visual) {
          const w = visual.clientWidth;
          const h = visual.clientHeight;
          const t = performance.now() / 1000;
          pointer.current.x = w * 0.5 + Math.sin(t * 0.38) * (w * 0.24);
          pointer.current.y = h * 0.48 + Math.cos(t * 0.44) * (h * 0.2);
        }
      }

      smooth.current.x += (pointer.current.x - smooth.current.x) * 0.12;
      smooth.current.y += (pointer.current.y - smooth.current.y) * 0.12;
      setRevealPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    const centerReveal = () => {
      const visual = wrap.querySelector<HTMLElement>('.hero-mobile-shoe-visual');
      if (!visual) return;
      const w = visual.clientWidth;
      const h = visual.clientHeight;
      pointer.current.x = w * 0.5;
      pointer.current.y = h * 0.48;
      smooth.current.x = pointer.current.x;
      smooth.current.y = pointer.current.y;
      setRevealPos({ x: smooth.current.x, y: smooth.current.y });
    };

    centerReveal();
    wrap.addEventListener('touchstart', onTouchStart, { passive: true });
    wrap.addEventListener('touchmove', onTouchMove, { passive: true });
    wrap.addEventListener('touchend', onTouchEnd, { passive: true });
    wrap.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('resize', centerReveal, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      wrap.removeEventListener('touchstart', onTouchStart);
      wrap.removeEventListener('touchmove', onTouchMove);
      wrap.removeEventListener('touchend', onTouchEnd);
      wrap.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', centerReveal);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      className={`hero-mobile${className ? ` ${className}` : ''}`}
      aria-label="Rahi Boot House hero"
    >
      <div className="hero-mobile-inner">
        <div className="hero-mobile-copy">
          <p className="hero-mobile-label hero-mobile-anim-label">✦ RAHI BOOT HOUSE ✦</p>

          <h1 className="hero-mobile-heading hero-mobile-anim-heading" aria-label="Walking With You">
            Walking With You
          </h1>

          <p className="hero-mobile-since hero-mobile-anim-since">Since 1959</p>

          <p className="hero-mobile-supporting hero-mobile-anim-supporting">
            Three Generations of Trust
          </p>

          <div className="hero-mobile-actions hero-mobile-anim-actions">
            <a href="/about/" className="hero-mobile-btn-primary">
              Explore Our Legacy
            </a>
            <a href="/contact/" className="hero-mobile-btn-secondary">
              Contact Us
            </a>
          </div>
        </div>

        <div ref={shoeWrapRef} className="hero-mobile-shoe-wrap">
          <MobileShoeReveal pointerX={revealPos.x} pointerY={revealPos.y} />
        </div>
      </div>
    </section>
  );
}
