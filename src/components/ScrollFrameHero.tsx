import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroChapterText from './HeroChapterText';
import { HeroHoverReveal } from './HeroHoverReveal';
import { MobileHeroShoeLoop } from './home/MobileHeroShoeLoop';
import { HERO_CHAPTERS } from './heroChapters';
import {
  chapterForProgress,
  HeroTextTransitionController,
} from './heroTextTransition';
import { drawMobileHeroFrame, isMobileHeroFrameViewport } from '../hero/mobileFrameDraw';
import {
  applyMobileTailVisuals,
  computeMobileTailVisuals,
  DESKTOP_SCROLL_HEIGHT_VH,
  getScrollPinHeightStyle,
  isMobileTailTransitionEnabled,
  normalizeMobilePinSpacer,
  primeMobileBrandsHidden,
  resetMobileBrandsDock,
  resetMobileTailVisuals,
  setMobileBrandsDock,
  splitHeroScrollProgress,
} from '../hero/mobileHeroTail';

const FRAME_COUNT = 192;

gsap.registerPlugin(ScrollTrigger);

function frameUrl(index: number): string {
  return `/frames/frame_${String(index + 1).padStart(3, '0')}.jpg`;
}

function drawCover(
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

  const scale = Math.max(width / imgW, height / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;

  ctx.drawImage(image, dx, dy, drawW, drawH);
}

type ScrollFrameHeroProps = {
  className?: string;
};

export function ScrollFrameHero({ className = '' }: ScrollFrameHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const dimOverlayRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(-1);
  const rafRef = useRef(0);
  const progressRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const textCtrlRef = useRef<HeroTextTransitionController | null>(null);
  const hoverRevealActiveRef = useRef(true);
  const [framesReady, setFramesReady] = useState(false);
  const [hoverRevealActive, setHoverRevealActive] = useState(true);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [pinHeightStyle, setPinHeightStyle] = useState(`${DESKTOP_SCROLL_HEIGHT_VH}vh`);

  const tailElements = useCallback(
    () => ({
      dimOverlay: dimOverlayRef.current,
    }),
    [],
  );

  const syncMobileTailVisuals = useCallback(
    (rawProgress: number) => {
      if (!isMobileHeroFrameViewport()) {
        resetMobileTailVisuals(tailElements());
        resetMobileBrandsDock();
        return;
      }

      if (!isMobileTailTransitionEnabled()) {
        resetMobileTailVisuals(tailElements());
        return;
      }

      const split = splitHeroScrollProgress(rawProgress);

      if (split.tailProgress <= 0 && split.sequenceProgress < 1) {
        primeMobileBrandsHidden();
        applyMobileTailVisuals(
          {
            dimOpacity: 0,
            contentOpacity: 1,
            canvasOpacity: 1,
            brandsOpacity: 0,
            brandsTranslateY: 60,
          },
          tailElements(),
        );
        return;
      }

      applyMobileTailVisuals(
        computeMobileTailVisuals(split.tailProgress),
        tailElements(),
      );
    },
    [tailElements],
  );

  const syncHoverReveal = useCallback((atFirstFrame: boolean) => {
    if (hoverRevealActiveRef.current === atFirstFrame) return;
    hoverRevealActiveRef.current = atFirstFrame;
    setHoverRevealActive(atFirstFrame);
  }, []);

  const resolveFrameIndex = useCallback((target: number, frames: HTMLImageElement[]) => {
    if (frames[target]?.complete && frames[target].naturalWidth > 0) {
      return target;
    }

    for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
      const before = target - offset;
      const after = target + offset;
      if (
        before >= 0 &&
        frames[before]?.complete &&
        frames[before].naturalWidth > 0
      ) {
        return before;
      }
      if (
        after < FRAME_COUNT &&
        frames[after]?.complete &&
        frames[after].naturalWidth > 0
      ) {
        return after;
      }
    }

    return 0;
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    const frames = framesRef.current;
    const image = frames[index];
    if (!canvas || !sticky || !image?.complete || image.naturalWidth === 0) return;

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
    if (isMobileHeroFrameViewport()) {
      drawMobileHeroFrame(ctx, image, w, h);
    } else {
      drawCover(ctx, image, w, h);
    }
    frameIndexRef.current = index;
  }, []);

  const renderFrameForProgress = useCallback(() => {
    const { sequenceProgress } = splitHeroScrollProgress(progressRef.current);
    const targetIndex = Math.round(sequenceProgress * (FRAME_COUNT - 1));
    const frameIndex = resolveFrameIndex(targetIndex, framesRef.current);

    syncHoverReveal(frameIndex === 0);

    if (frameIndex !== frameIndexRef.current) {
      drawFrame(frameIndex);
    }

    textCtrlRef.current?.sync(sequenceProgress);
  }, [drawFrame, syncHoverReveal, resolveFrameIndex]);

  useLayoutEffect(() => {
    const block = textBlockRef.current;
    if (!block) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const controller = new HeroTextTransitionController();
    controller.setReducedMotion(reducedMotion);
    controller.attach(block, setChapterIndex);
    textCtrlRef.current = controller;

    if (reducedMotion) {
      gsap.set(block, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 });
    } else {
      controller.playIntro();
    }

    return () => {
      controller.detach();
      textCtrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);

    const loadFrame = (index: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = frameUrl(index);
        images[index] = img;
      });

    const preload = async () => {
      await loadFrame(0);
      if (cancelled) return;

      framesRef.current = images;
      setFramesReady(true);
      drawFrame(0);

      const batchSize = 16;
      for (let start = 1; start < FRAME_COUNT; start += batchSize) {
        if (cancelled) return;
        const tasks: Promise<void>[] = [];
        for (let i = start; i < Math.min(start + batchSize, FRAME_COUNT); i += 1) {
          tasks.push(loadFrame(i));
        }
        await Promise.all(tasks);
      }
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, [drawFrame]);

  useLayoutEffect(() => {
    if (isMobileHeroFrameViewport()) {
      setMobileBrandsDock(true);
    }
  }, []);

  useEffect(() => {
    const syncPinHeight = () => {
      const heightStyle = getScrollPinHeightStyle();
      setPinHeightStyle(heightStyle);
      if (sectionRef.current) {
        sectionRef.current.style.height = heightStyle;
      }
      if (!isMobileHeroFrameViewport()) {
        resetMobileTailVisuals({ dimOverlay: dimOverlayRef.current });
        resetMobileBrandsDock();
      } else if (isMobileTailTransitionEnabled()) {
        primeMobileBrandsHidden();
      } else {
        resetMobileTailVisuals({ dimOverlay: dimOverlayRef.current });
        setMobileBrandsDock(true);
      }
    };

    syncPinHeight();

    window.addEventListener('resize', syncPinHeight, { passive: true });

    return () => {
      window.removeEventListener('resize', syncPinHeight);
      resetMobileTailVisuals(tailElements());
    };
  }, [tailElements]);

  useEffect(() => {
    if (!framesReady) return;

    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    section.style.height = getScrollPinHeightStyle();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let matchMediaInstance: ReturnType<typeof ScrollTrigger.matchMedia> | null = null;

    if (!reducedMotion) {
      matchMediaInstance = ScrollTrigger.matchMedia({
        '(min-width: 768px)': () => {
          scrollTriggerRef.current?.kill();
          scrollTriggerRef.current = ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            pin: sticky,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressRef.current = self.progress;
              syncMobileTailVisuals(self.progress);
            },
          });

          resetMobileBrandsDock();

          return () => {
            scrollTriggerRef.current?.kill();
            scrollTriggerRef.current = null;
            resetMobileBrandsDock();
          };
        },
        '(max-width: 767px)': () => {
          scrollTriggerRef.current?.kill();
          scrollTriggerRef.current = ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            pin: sticky,
            // Mobile: pin-spacer adds ~100vh dead space after the hero; disable it.
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: () => {
              setMobileBrandsDock(true);
            },
            onEnterBack: () => {
              setMobileBrandsDock(true);
            },
            onLeave: () => {
              setMobileBrandsDock(false);
            },
            onLeaveBack: () => {
              setMobileBrandsDock(false);
            },
            onUpdate: (self) => {
              progressRef.current = self.progress;
              syncMobileTailVisuals(self.progress);
            },
          });

          normalizeMobilePinSpacer(sticky);
          setMobileBrandsDock(true);
          ScrollTrigger.refresh();

          return () => {
            scrollTriggerRef.current?.kill();
            scrollTriggerRef.current = null;
            resetMobileBrandsDock();
          };
        },
      });
    } else {
      progressRef.current = 0;
      drawFrame(0);
      resetMobileTailVisuals(tailElements());
    }

    syncMobileTailVisuals(progressRef.current);

    const initialChapter = chapterForProgress(
      splitHeroScrollProgress(progressRef.current).sequenceProgress,
    );
    if (progressRef.current > 0.002) {
      textCtrlRef.current?.snapToChapter(initialChapter);
      setChapterIndex(initialChapter);
    }

    const initialFrame = resolveFrameIndex(
      Math.round(
        splitHeroScrollProgress(progressRef.current).sequenceProgress * (FRAME_COUNT - 1),
      ),
      framesRef.current,
    );
    drawFrame(initialFrame);
    syncHoverReveal(initialFrame === 0);

    const tick = () => {
      renderFrameForProgress();
      rafRef.current = requestAnimationFrame(tick);
    };

    const onResize = () => {
      section.style.height = getScrollPinHeightStyle();
      setPinHeightStyle(getScrollPinHeightStyle());
      normalizeMobilePinSpacer(sticky);
      ScrollTrigger.refresh();
      const idx = frameIndexRef.current >= 0 ? frameIndexRef.current : 0;
      drawFrame(idx);
      syncMobileTailVisuals(progressRef.current);
    };

    const onMobileViewportChange = () => {
      if (!isMobileHeroFrameViewport()) return;
      section.style.height = getScrollPinHeightStyle();
      setPinHeightStyle(getScrollPinHeightStyle());
      normalizeMobilePinSpacer(sticky);
      ScrollTrigger.refresh();
      const idx = frameIndexRef.current >= 0 ? frameIndexRef.current : 0;
      drawFrame(idx);
      syncMobileTailVisuals(progressRef.current);
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize, { passive: true });
    window.visualViewport?.addEventListener('resize', onMobileViewportChange);
    window.addEventListener('orientationchange', onMobileViewportChange);

    const refreshAfterLayout = () => {
      normalizeMobilePinSpacer(sticky);
      ScrollTrigger.refresh();
    };

    ScrollTrigger.refresh();
    const refreshAfterReveal = window.setTimeout(refreshAfterLayout, 1500);
    const refreshAfterFrames = window.setTimeout(refreshAfterLayout, 100);
    void document.fonts?.ready?.then(refreshAfterLayout);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onMobileViewportChange);
      window.removeEventListener('orientationchange', onMobileViewportChange);
      window.clearTimeout(refreshAfterReveal);
      window.clearTimeout(refreshAfterFrames);
      matchMediaInstance?.kill();
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;
      resetMobileTailVisuals(tailElements());
      resetMobileBrandsDock();
    };
  }, [
    framesReady,
    drawFrame,
    renderFrameForProgress,
    resolveFrameIndex,
    syncHoverReveal,
    syncMobileTailVisuals,
    tailElements,
  ]);

  const chapter = HERO_CHAPTERS[chapterIndex] ?? HERO_CHAPTERS[0];

  return (
    <div
      className={`scroll-hero-root tracking-[-0.02em]${className ? ` ${className}` : ''}`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <section
        ref={sectionRef}
        className="scroll-hero-pin"
        style={{ height: pinHeightStyle }}
        aria-label="Rahi Boot House hero"
      >
        <div ref={stickyRef} className="scroll-hero-sticky">
          <canvas
            ref={canvasRef}
            className="scroll-hero-canvas"
            aria-hidden="true"
          />

          <div
            ref={dimOverlayRef}
            className="scroll-hero-mobile-dim"
            aria-hidden="true"
          />

          {framesReady && (
            <HeroHoverReveal
              containerRef={stickyRef}
              active={hoverRevealActive}
            />
          )}

          <div className="hero-text-gradient" aria-hidden="true" />

          <div
            ref={heroContentRef}
            className="hero-content-luxury scroll-hero-content"
          >
            <div className="hero-text-stage" aria-live="polite">
              <p className="hero-lux-label scroll-hero-label scroll-hero-brand">
                RAHI BOOT HOUSE
              </p>
              <div className="hero-text-stage-inner">
                <div
                  ref={textBlockRef}
                  className="hero-text-block"
                  data-chapter={chapterIndex}
                >
                  <HeroChapterText chapter={chapter} />
                </div>
              </div>
            </div>

            <div className="hero-lux-actions">
              <a href="/about/" className="hero-lux-btn-primary">
                Explore Our Legacy
              </a>
              <a href="/contact/" className="hero-lux-btn-secondary">
                Contact Us
              </a>
            </div>
          </div>

          <MobileHeroShoeLoop />
        </div>
      </section>
    </div>
  );
}
