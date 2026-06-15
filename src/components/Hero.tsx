import { useEffect, useRef, useState } from 'react';
import { RevealLayer } from './RevealLayer';
import { SpecialText } from './SpecialText';

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

        {/* Heading */}
        <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
          <h1
            className="text-white leading-[0.95] font-syne font-semibold"
            aria-label="Heritage in Every Step"
          >
            <span className="block text-5xl sm:text-7xl md:text-8xl" style={{ letterSpacing: '-0.04em' }}>
              <SpecialText
                className="font-syne text-5xl sm:text-7xl md:text-8xl leading-[0.95]"
                delay={0.25}
                speed={18}
              >
                Heritage in
              </SpecialText>
            </span>
            <span
              className="block text-5xl sm:text-7xl md:text-8xl -mt-1"
              style={{ letterSpacing: '-0.06em' }}
            >
              <SpecialText
                className="font-syne text-5xl sm:text-7xl md:text-8xl leading-[0.95]"
                delay={0.55}
                speed={18}
              >
                Every Step
              </SpecialText>
            </span>
          </h1>
        </div>

        {/* Bottom-left */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[320px] z-50 pointer-events-none hero-anim hero-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="font-dm text-base sm:text-lg text-white/85 leading-relaxed">
            Rahi Boot House has been a trusted name in footwear since 1959, proudly
            serving generations of families in Gwalior with quality, comfort, and
            reliability.
          </p>
        </div>

        {/* Bottom-right */}
        <div
          className="absolute bottom-5 sm:bottom-14 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[320px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="font-dm text-base sm:text-lg text-white/85 leading-relaxed pointer-events-none">
            From school shoes to sports footwear, men&apos;s, women&apos;s, and kids&apos;
            collections — partnered with Bata, Campus, Liberty, Red Chief, and more.
            Walking With You Since 1959.
          </p>
        </div>
      </section>
    </div>
  );
}