import { useEffect, useRef, type RefObject } from 'react';

const REVEAL_IMAGE_SRC = '/i1.png';
const SPOTLIGHT_RADIUS = 250;
const LERP_TAU_MS = 150;
const OPACITY_LERP = 0.14;

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  if (!imgW || !imgH) return;

  const scale = Math.max(width / imgW, height / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;

  ctx.drawImage(image, dx, dy, drawW, drawH);
}

function drawSpotlightReveal(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  cx: number,
  cy: number,
  opacity: number,
) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, width, height);

  if (opacity <= 0.001) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  drawCover(ctx, image, width, height);

  ctx.globalCompositeOperation = 'destination-in';
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, SPOTLIGHT_RADIUS);
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(0.42, 'rgba(0,0,0,1)');
  gradient.addColorStop(0.58, 'rgba(0,0,0,0.78)');
  gradient.addColorStop(0.72, 'rgba(0,0,0,0.42)');
  gradient.addColorStop(0.86, 'rgba(0,0,0,0.14)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

type HeroHoverRevealProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  active: boolean;
};

export function HeroHoverReveal({ containerRef, active }: HeroHoverRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageReadyRef = useRef(false);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hoveringRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const opacityRef = useRef(0);
  const activeRef = useRef(active);

  activeRef.current = active;

  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      imageRef.current = img;
      imageReadyRef.current = true;
    };
    img.onerror = () => {
      imageReadyRef.current = false;
    };
    img.src = REVEAL_IMAGE_SRC;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  useEffect(() => {
    const interaction = interactionRef.current;
    const container = containerRef.current;
    if (!interaction || !container) return;

    const updateTargetFromEvent = (event: MouseEvent) => {
      if (!activeRef.current) return;
      const rect = container.getBoundingClientRect();
      targetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onMouseEnter = (event: MouseEvent) => {
      if (!activeRef.current) return;
      hoveringRef.current = true;
      updateTargetFromEvent(event);
      smoothRef.current = { ...targetRef.current };
    };

    const onMouseMove = (event: MouseEvent) => {
      updateTargetFromEvent(event);
    };

    const onMouseLeave = () => {
      hoveringRef.current = false;
    };

    interaction.addEventListener('mouseenter', onMouseEnter);
    interaction.addEventListener('mousemove', onMouseMove);
    interaction.addEventListener('mouseleave', onMouseLeave);

    return () => {
      interaction.removeEventListener('mouseenter', onMouseEnter);
      interaction.removeEventListener('mousemove', onMouseMove);
      interaction.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!active) {
      hoveringRef.current = false;
      opacityRef.current = 0;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const tick = (time: number) => {
      const delta = lastTimeRef.current ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      const sticky = containerRef.current;
      const image = imageRef.current;
      const isActive = activeRef.current;

      if (canvas && sticky && image && imageReadyRef.current) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = sticky.clientWidth;
        const h = sticky.clientHeight;

        if (w > 0 && h > 0) {
          const pxW = Math.floor(w * dpr);
          const pxH = Math.floor(h * dpr);

          if (canvas.width !== pxW || canvas.height !== pxH) {
            canvas.width = pxW;
            canvas.height = pxH;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (!isActive) {
              ctx.clearRect(0, 0, w, h);
            } else {
              const lerpFactor = 1 - Math.exp(-delta / LERP_TAU_MS);
              const smooth = smoothRef.current;
              const target = targetRef.current;

              smooth.x += (target.x - smooth.x) * lerpFactor;
              smooth.y += (target.y - smooth.y) * lerpFactor;

              const opacityTarget = hoveringRef.current ? 1 : 0;
              opacityRef.current += (opacityTarget - opacityRef.current) * OPACITY_LERP;

              drawSpotlightReveal(ctx, image, w, h, smooth.x, smooth.y, opacityRef.current);
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, containerRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="scroll-hero-reveal-canvas"
        aria-hidden="true"
      />
      <div
        ref={interactionRef}
        className="scroll-hero-reveal-interaction"
        style={{ pointerEvents: active ? 'auto' : 'none' }}
        aria-hidden="true"
      />
    </>
  );
}
