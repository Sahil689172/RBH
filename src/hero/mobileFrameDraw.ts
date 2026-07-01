/** Mobile-only JPEG sequence rendering (≤767px). Desktop uses drawCover in ScrollFrameHero. */

export const MOBILE_HERO_FRAME_MQ = '(max-width: 767px)';

export function isMobileHeroFrameViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_HERO_FRAME_MQ).matches;
}

/**
 * Fit the full frame inside the viewport — equivalent to object-fit: contain.
 * Anchored below the navbar with ~10px breathing room; never crops.
 */
export function drawMobileHeroFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  if (!imgW || !imgH) return;

  const navHeight =
    typeof window !== 'undefined'
      ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 56
      : 56;
  const topInset = navHeight + 10;
  const availableHeight = Math.max(height - topInset, height * 0.45);

  const scale = Math.min(width / imgW, availableHeight / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const dx = (width - drawW) / 2;
  const dy = topInset;

  ctx.drawImage(image, dx, dy, drawW, drawH);
}
