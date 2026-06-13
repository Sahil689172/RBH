import { useEffect, useRef } from 'react';

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
  spotlightR: number;
}

export function RevealLayer({
  image,
  cursorX,
  cursorY,
  spotlightR,
}: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!canvas || !reveal) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      spotlightR,
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.18, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.32, 'rgba(255,255,255,0.94)');
    gradient.addColorStop(0.46, 'rgba(255,255,255,0.78)');
    gradient.addColorStop(0.58, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(0.68, 'rgba(255,255,255,0.34)');
    gradient.addColorStop(0.78, 'rgba(255,255,255,0.18)');
    gradient.addColorStop(0.86, 'rgba(255,255,255,0.08)');
    gradient.addColorStop(0.92, 'rgba(255,255,255,0.03)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, spotlightR, 0, Math.PI * 2);
    ctx.fill();

    const maskUrl = canvas.toDataURL();
    reveal.style.maskImage = `url(${maskUrl})`;
    reveal.style.webkitMaskImage = `url(${maskUrl})`;
    reveal.style.maskSize = '100% 100%';
    reveal.style.webkitMaskSize = '100% 100%';
  }, [cursorX, cursorY, image, spotlightR]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'none' }}
      />
      <div
        ref={revealRef}
        className="absolute inset-0 hero-image-layer hero-image-position z-30 pointer-events-none"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="hero-image-grade" aria-hidden="true" />
      </div>
    </>
  );
}
