import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';

const FRAME_COUNT = 185;
const SCROLL_HEIGHT_VH = 400;
const SHOE_ANCHOR_Y = 0.625;
const FINALE_AT = 0.88;

const STAGE_COUNT = 4;

function frameUrl(index: number): string {
  const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, index));
  return `/homepage_frames/frame_${String(clamped + 1).padStart(4, '0')}.jpg`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function drawFrameAnchored(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  if (!imgW || !imgH) return;

  let scale = Math.min(width / imgW, height / imgH);

  const roomAbove = SHOE_ANCHOR_Y * height;
  const roomBelow = (1 - SHOE_ANCHOR_Y) * height;
  scale = Math.min(
    scale,
    (roomAbove * 2) / imgH,
    (roomBelow * 2) / imgH,
    width / imgW,
  ) * 0.96;

  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const dx = (width - drawW) / 2;
  let dy = height * SHOE_ANCHOR_Y - drawH / 2;
  dy = clamp(dy, 0, height - drawH);

  ctx.drawImage(image, dx, dy, drawW, drawH);
}

function progressToStage(progress: number): number {
  if (progress >= FINALE_AT) return -1;
  const normalized = progress / FINALE_AT;
  return clamp(Math.floor(normalized * STAGE_COUNT), 0, STAGE_COUNT - 1);
}

export function FrameSequenceHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(-1);
  const rafRef = useRef(0);
  const activeStageRef = useRef(0);
  const finaleVisibleRef = useRef(false);
  const loadProgressRef = useRef({ el: null as HTMLSpanElement | null, value: 0 });
  const loadedRef = useRef(false);

  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finaleRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const crossfadeToStage = useCallback((next: number) => {
    if (next === activeStageRef.current) return;

    const prevEl = stageRefs.current[activeStageRef.current];
    const nextEl = stageRefs.current[next];

    if (prevEl) {
      gsap.to(prevEl, {
        opacity: 0,
        y: -10,
        filter: 'blur(4px)',
        duration: 0.4,
        ease: 'power2.inOut',
        pointerEvents: 'none',
      });
    }

    if (nextEl) {
      gsap.fromTo(
        nextEl,
        { opacity: 0, y: 20, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power2.inOut',
          pointerEvents: 'auto',
        },
      );
    }

    activeStageRef.current = next;
    finaleVisibleRef.current = false;
  }, []);

  const showFinale = useCallback(() => {
    if (finaleVisibleRef.current) return;

    stageRefs.current.forEach((el) => {
      if (el) {
        gsap.to(el, {
          opacity: 0,
          y: -10,
          duration: 0.4,
          ease: 'power2.inOut',
        });
      }
    });

    const finale = finaleRef.current;
    if (finale) {
      gsap.fromTo(
        finale,
        { opacity: 0, y: 20, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power2.inOut',
        },
      );
    }

    finaleVisibleRef.current = true;
  }, []);

  const hideFinale = useCallback(() => {
    if (!finaleVisibleRef.current) return;

    const finale = finaleRef.current;
    if (finale) {
      gsap.to(finale, {
        opacity: 0,
        y: 10,
        filter: 'blur(4px)',
        duration: 0.4,
        ease: 'power2.inOut',
      });
    }

    finaleVisibleRef.current = false;

    const el = stageRefs.current[activeStageRef.current];
    if (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.4,
        ease: 'power2.inOut',
      });
    }
  }, []);

  const resizeAndDraw = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const sticky = canvas?.parentElement;
    const image = framesRef.current[index];
    if (!canvas || !sticky || !image?.complete) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = sticky.clientWidth;
    const h = sticky.clientHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrameAnchored(ctx, image, w, h);
    frameIndexRef.current = index;
  }, []);

  const onScrollFrame = useCallback(() => {
    const section = sectionRef.current;
    if (!section || !loadedRef.current) return;

    const viewport = window.innerHeight;
    const scrollable = section.offsetHeight - viewport;
    if (scrollable <= 0) return;

    const progress = clamp((window.scrollY - section.offsetTop) / scrollable, 0, 1);

    const frameIndex = Math.round(progress * (FRAME_COUNT - 1));
    if (frameIndex !== frameIndexRef.current) {
      resizeAndDraw(frameIndex);
    }

    if (progress >= FINALE_AT) {
      showFinale();
    } else {
      if (finaleVisibleRef.current) hideFinale();
      const stage = progressToStage(progress);
      if (stage >= 0) crossfadeToStage(stage);
    }
  }, [resizeAndDraw, crossfadeToStage, showFinale, hideFinale]);

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loadedCount = 0;

    const onFrameLoaded = () => {
      loadedCount += 1;
      const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      if (loadProgressRef.current.el) {
        loadProgressRef.current.el.textContent = `${pct}%`;
      }
      if (loadedCount === FRAME_COUNT && !cancelled) {
        framesRef.current = images;
        loadedRef.current = true;
        if (loadingRef.current) {
          gsap.to(loadingRef.current, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => {
              if (loadingRef.current) loadingRef.current.style.display = 'none';
            },
          });
        }
        resizeAndDraw(0);
        onScrollFrame();
      }
    };

    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(i);
      img.onload = onFrameLoaded;
      img.onerror = onFrameLoaded;
      images[i] = img;
    }

    return () => {
      cancelled = true;
    };
  }, [resizeAndDraw, onScrollFrame]);

  useEffect(() => {
    stageRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, {
        opacity: i === 0 ? 1 : 0,
        y: i === 0 ? 0 : 20,
        filter: i === 0 ? 'blur(0px)' : 'blur(6px)',
      });
    });
    if (finaleRef.current) {
      gsap.set(finaleRef.current, { opacity: 0, y: 20, filter: 'blur(6px)' });
    }

    const tick = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(onScrollFrame);
    };

    const onResize = () => {
      const idx = frameIndexRef.current >= 0 ? frameIndexRef.current : 0;
      resizeAndDraw(idx);
    };

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onScrollFrame, resizeAndDraw]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="frame-hero"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      aria-label="Rahi Boot House product reveal"
    >
      <div className="frame-hero__sticky">
        <canvas
          ref={canvasRef}
          className="frame-hero__canvas"
          aria-label="Footwear frame sequence"
        />

        <div className="frame-hero__text" aria-live="polite">
          <p className="frame-hero__brand">✦ RAHI BOOT HOUSE ✦</p>

          <div className="frame-hero__stages">
            <div
              ref={(el) => { stageRefs.current[0] = el; }}
              className="frame-hero__stage"
            >
              <h1 className="frame-hero__headline font-display">Walking With You</h1>
              <p className="frame-hero__since font-display">Since 1959</p>
            </div>

            <div
              ref={(el) => { stageRefs.current[1] = el; }}
              className="frame-hero__stage frame-hero__stage--single"
            >
              <p className="frame-hero__line font-display">Three Generations of Trust</p>
            </div>

            <div
              ref={(el) => { stageRefs.current[2] = el; }}
              className="frame-hero__stage frame-hero__stage--single"
            >
              <p className="frame-hero__line font-display">Serving Gwalior Since 1959</p>
            </div>

            <div
              ref={(el) => { stageRefs.current[3] = el; }}
              className="frame-hero__stage frame-hero__stage--single"
            >
              <p className="frame-hero__line font-display">65+ Years of Legacy</p>
            </div>

            <div ref={finaleRef} className="frame-hero__finale" aria-hidden="true">
              <h1 className="frame-hero__finale-title font-display">Walking With You</h1>
              <p className="frame-hero__finale-since font-display">Since 1959</p>
            </div>
          </div>
        </div>

        <div ref={loadingRef} className="frame-hero__loading" aria-live="polite">
          <span className="frame-hero__loading-label">Loading showcase</span>
          <span
            ref={(el) => { loadProgressRef.current.el = el; }}
            className="frame-hero__loading-pct"
          >
            0%
          </span>
        </div>

        <div className="frame-hero__shade-top" aria-hidden="true" />
      </div>
    </section>
  );
}
