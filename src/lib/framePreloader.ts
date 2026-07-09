/** Shared 185-frame hero sequence preloader — non-blocking, batched, scroll-aware. */

export const FRAME_COUNT = 185;
export const FRAME_BATCH_SIZE = 25;

export function buildFrameUrl(index: number): string {
  const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, index));
  return `/frames/frame_${String(clamped + 1).padStart(3, '0')}.jpg`;
}

type FramePreloadCache = {
  images: HTMLImageElement[];
  loaded: Set<number>;
  inFlight: Map<number, Promise<void>>;
  cancelled: boolean;
  scrollPaused: boolean;
};

let cache: FramePreloadCache | null = null;
let cancelPreload: (() => void) | null = null;

export function setFramePreloadScrollPaused(paused: boolean): void {
  if (cache) cache.scrollPaused = paused;
}

export function getFrameImages(): HTMLImageElement[] {
  return cache?.images ?? [];
}

export function isFrameDecoded(index: number): boolean {
  const img = cache?.images[index];
  return Boolean(img?.complete && img.naturalWidth > 0 && cache?.loaded.has(index));
}

async function decodeImage(img: HTMLImageElement): Promise<void> {
  if (typeof img.decode !== 'function') return;
  try {
    await img.decode();
  } catch {
    /* decode can fail on some browsers; draw still works after onload */
  }
}

function idle(timeout = 1200): Promise<void> {
  return new Promise((resolve) => {
    const cb = () => resolve();
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(cb, { timeout });
    } else {
      window.setTimeout(cb, 16);
    }
  });
}

export function startFramePreload(): () => void {
  if (cancelPreload) return cancelPreload;

  const images: HTMLImageElement[] = new Array(FRAME_COUNT);
  const state: FramePreloadCache = {
    images,
    loaded: new Set(),
    inFlight: new Map(),
    cancelled: false,
    scrollPaused: false,
  };
  cache = state;

  const loadSingle = (index: number): Promise<void> => {
    if (state.cancelled) return Promise.resolve();
    if (state.loaded.has(index)) return Promise.resolve();

    const existing = state.inFlight.get(index);
    if (existing) return existing;

    const promise = new Promise<void>((resolve) => {
      let img = state.images[index];
      if (!img) {
        img = new Image();
        img.decoding = 'async';
        state.images[index] = img;
      }

      const finish = async () => {
        state.inFlight.delete(index);
        if (!state.cancelled && img.naturalWidth > 0) {
          if (!state.scrollPaused) {
            await decodeImage(img);
          }
          state.loaded.add(index);
        }
        resolve();
      };

      if (img.complete && img.naturalWidth > 0) {
        void finish();
        return;
      }

      img.onload = () => void finish();
      img.onerror = () => void finish();
      if (!img.src) {
        img.src = buildFrameUrl(index);
      }
    });

    state.inFlight.set(index, promise);
    return promise;
  };

  const waitWhileScrolling = async () => {
    while (state.scrollPaused && !state.cancelled) {
      await idle(400);
    }
  };

  const loadBatch = async (start: number, end: number) => {
    if (state.cancelled) return;
    await waitWhileScrolling();
    if (state.cancelled) return;

    const tasks: Promise<void>[] = [];
    for (let i = start; i < end; i += 1) {
      tasks.push(loadSingle(i));
    }
    await Promise.all(tasks);
    await idle(state.scrollPaused ? 1600 : 800);
  };

  void (async () => {
    await loadSingle(0);
    for (let start = 1; start < FRAME_COUNT; start += FRAME_BATCH_SIZE) {
      const end = Math.min(start + FRAME_BATCH_SIZE, FRAME_COUNT);
      await loadBatch(start, end);
    }
  })();

  const cancel = () => {
    state.cancelled = true;
    state.inFlight.clear();
    cancelPreload = null;
  };

  cancelPreload = cancel;
  return cancel;
}

export function cancelFramePreload(): void {
  cancelPreload?.();
}
