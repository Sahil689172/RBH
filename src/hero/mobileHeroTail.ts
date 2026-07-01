/** Mobile-only hero → brands handoff (≤767px). Desktop is unchanged. */

import { isMobileHeroFrameViewport } from './mobileFrameDraw';

export const DESKTOP_SCROLL_HEIGHT_VH = 400;
export const MOBILE_SEQUENCE_VH = 400;
/** Extra pin scroll after the last frame — 0 keeps JPEG sync identical to desktop distance. */
export const MOBILE_TAIL_VH = 0;
export const MOBILE_TOTAL_SCROLL_VH = MOBILE_SEQUENCE_VH + MOBILE_TAIL_VH;

export function isMobileTailTransitionEnabled(): boolean {
  return isMobileHeroFrameViewport() && MOBILE_TAIL_VH > 0;
}

export function getScrollPinHeightVh(): number {
  return isMobileHeroFrameViewport() ? MOBILE_TOTAL_SCROLL_VH : DESKTOP_SCROLL_HEIGHT_VH;
}

/** Mobile uses dvh so scroll distance tracks the visible viewport (address bar). */
export function getScrollPinHeightStyle(): string {
  return isMobileHeroFrameViewport()
    ? `${MOBILE_TOTAL_SCROLL_VH}dvh`
    : `${DESKTOP_SCROLL_HEIGHT_VH}vh`;
}

/** GSAP wraps the pinned sticky in `.pin-spacer`; normalize on mobile only. */
export function normalizeMobilePinSpacer(sticky: HTMLElement | null): void {
  if (!sticky || !isMobileHeroFrameViewport()) return;

  const spacer = sticky.parentElement;
  if (!spacer?.classList.contains('pin-spacer')) return;

  spacer.style.marginBottom = '0';
  spacer.style.paddingBottom = '0';
  spacer.style.minHeight = '0';
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

export type HeroProgressSplit = {
  sequenceProgress: number;
  tailProgress: number;
};

export function splitHeroScrollProgress(rawProgress: number): HeroProgressSplit {
  if (!isMobileHeroFrameViewport()) {
    return { sequenceProgress: clamp01(rawProgress), tailProgress: 0 };
  }

  const sequenceRatio = MOBILE_SEQUENCE_VH / MOBILE_TOTAL_SCROLL_VH;
  const raw = clamp01(rawProgress);

  if (raw <= sequenceRatio) {
    return { sequenceProgress: raw / sequenceRatio, tailProgress: 0 };
  }

  return {
    sequenceProgress: 1,
    tailProgress: (raw - sequenceRatio) / (1 - sequenceRatio),
  };
}

export type MobileTailVisuals = {
  dimOpacity: number;
  contentOpacity: number;
  canvasOpacity: number;
  brandsOpacity: number;
  brandsTranslateY: number;
};

export function computeMobileTailVisuals(tailProgress: number): MobileTailVisuals {
  const tail = clamp01(tailProgress);
  const brandsEase = easeOutCubic(tail);

  return {
    dimOpacity: tail * 0.4,
    contentOpacity: 1 - easeOutCubic(clamp01(tail / 0.42)),
    canvasOpacity: 1 - easeOutCubic(clamp01((tail - 0.7) / 0.3)),
    brandsOpacity: brandsEase,
    brandsTranslateY: 60 * (1 - brandsEase),
  };
}

const BRANDS_OPACITY_VAR = '--mobile-brands-opacity';
const BRANDS_Y_VAR = '--mobile-brands-y';
const HERO_CONTENT_OPACITY_VAR = '--mobile-hero-content-opacity';
const HERO_CANVAS_OPACITY_VAR = '--mobile-hero-canvas-opacity';
const MOBILE_BRANDS_DOCK_CLASS = 'hero-brands-dock';

export function setMobileBrandsDock(active: boolean): void {
  if (!isMobileHeroFrameViewport()) {
    document.body.classList.remove(MOBILE_BRANDS_DOCK_CLASS);
    return;
  }
  document.body.classList.toggle(MOBILE_BRANDS_DOCK_CLASS, active);
}

export function resetMobileBrandsDock(): void {
  document.body.classList.remove(MOBILE_BRANDS_DOCK_CLASS);
}

export function applyMobileTailVisuals(
  visuals: MobileTailVisuals,
  elements: {
    dimOverlay: HTMLElement | null;
  },
): void {
  const { dimOverlay } = elements;
  const root = document.documentElement;

  if (dimOverlay) {
    dimOverlay.style.opacity = String(visuals.dimOpacity);
  }

  root.style.setProperty(HERO_CANVAS_OPACITY_VAR, String(visuals.canvasOpacity));
  root.style.setProperty(HERO_CONTENT_OPACITY_VAR, String(visuals.contentOpacity));
  root.style.setProperty(BRANDS_OPACITY_VAR, String(visuals.brandsOpacity));
  root.style.setProperty(BRANDS_Y_VAR, `${visuals.brandsTranslateY}px`);
}

export function resetMobileTailVisuals(elements: {
  dimOverlay: HTMLElement | null;
}): void {
  applyMobileTailVisuals(
    {
      dimOpacity: 0,
      contentOpacity: 1,
      canvasOpacity: 1,
      brandsOpacity: 1,
      brandsTranslateY: 0,
    },
    elements,
  );

  const root = document.documentElement;
  root.style.removeProperty(BRANDS_OPACITY_VAR);
  root.style.removeProperty(BRANDS_Y_VAR);
  root.style.removeProperty(HERO_CONTENT_OPACITY_VAR);
  root.style.removeProperty(HERO_CANVAS_OPACITY_VAR);
  resetMobileBrandsDock();

  if (elements.dimOverlay) {
    elements.dimOverlay.style.opacity = '0';
  }
}

export function primeMobileBrandsHidden(): void {
  if (!isMobileHeroFrameViewport()) return;
  document.documentElement.style.setProperty(BRANDS_OPACITY_VAR, '0');
  document.documentElement.style.setProperty(BRANDS_Y_VAR, '60px');
}
