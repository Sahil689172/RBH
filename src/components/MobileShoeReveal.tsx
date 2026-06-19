import { useEffect, useRef } from 'react';

const BASE_IMAGE = '/i3.png';
const REVEAL_IMAGE = '/i4.png';

type MobileShoeRevealProps = {
  pointerX: number;
  pointerY: number;
};

export function MobileShoeReveal({ pointerX, pointerY }: MobileShoeRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!container || !canvas || !reveal) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      canvas.width = width;
      canvas.height = height;
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!container || !canvas || !reveal) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const spotlightR = Math.max(width, height) * 0.42;

    const localX = Math.min(width, Math.max(0, pointerX));
    const localY = Math.min(height, Math.max(0, pointerY));

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(
      localX,
      localY,
      0,
      localX,
      localY,
      spotlightR,
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.82)');
    gradient.addColorStop(0.72, 'rgba(255,255,255,0.45)');
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(localX, localY, spotlightR, 0, Math.PI * 2);
    ctx.fill();

    const maskUrl = canvas.toDataURL('image/png');
    reveal.style.maskImage = `url(${maskUrl})`;
    reveal.style.webkitMaskImage = `url(${maskUrl})`;
    reveal.style.maskSize = '100% 100%';
    reveal.style.webkitMaskSize = '100% 100%';
  }, [pointerX, pointerY]);

  return (
    <div ref={containerRef} className="hero-mobile-shoe-visual">
      <img
        src={BASE_IMAGE}
        alt=""
        className="hero-mobile-shoe-base"
        width={420}
        height={520}
        decoding="async"
        draggable={false}
      />
      <canvas ref={canvasRef} className="hero-mobile-shoe-canvas" aria-hidden="true" />
      <div
        ref={revealRef}
        className="hero-mobile-shoe-reveal"
        style={{ backgroundImage: `url(${REVEAL_IMAGE})` }}
        aria-hidden="true"
      />
    </div>
  );
}
