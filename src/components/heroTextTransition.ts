import gsap from 'gsap';

export const HERO_CHAPTER_COUNT = 4;

const EXIT_DURATION = 0.35;
const ENTER_DURATION = 0.35;
const EASE = 'power2.inOut';

const SETTLED = {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  scale: 1,
};

const EXIT_TO = {
  opacity: 0,
  y: -40,
  filter: 'blur(12px)',
  scale: 0.98,
};

const ENTER_FROM = {
  opacity: 0,
  y: 40,
  filter: 'blur(12px)',
  scale: 0.98,
};

type Phase = 'idle' | 'exit' | 'enter';

export function chapterForProgress(progress: number): number {
  const scaled = progress * HERO_CHAPTER_COUNT;
  if (scaled >= HERO_CHAPTER_COUNT) {
    return HERO_CHAPTER_COUNT - 1;
  }
  return Math.floor(scaled);
}

export class HeroTextTransitionController {
  private el: HTMLElement | null = null;

  private onSwap: ((chapter: number) => void) | null = null;

  private settled = 0;

  private displayed = 0;

  private target = 0;

  private phase: Phase = 'idle';

  private tween: gsap.core.Tween | null = null;

  private reducedMotion = false;

  attach(el: HTMLElement, onSwap: (chapter: number) => void) {
    this.el = el;
    this.onSwap = onSwap;
  }

  detach() {
    this.killTween();
    this.el = null;
    this.onSwap = null;
  }

  setReducedMotion(reduced: boolean) {
    this.reducedMotion = reduced;
  }

  playIntro() {
    const el = this.el;
    if (!el || this.reducedMotion) return;

    this.killTween();
    gsap.set(el, ENTER_FROM);
    this.tween = gsap.to(el, {
      ...SETTLED,
      duration: 0.65,
      ease: EASE,
      delay: 0.15,
      onComplete: () => {
        this.tween = null;
      },
    });
  }

  snapToChapter(chapter: number) {
    this.killTween();
    this.settled = chapter;
    this.displayed = chapter;
    this.target = chapter;
    this.phase = 'idle';
    if (this.el) {
      gsap.set(this.el, SETTLED);
    }
    this.onSwap?.(chapter);
  }

  sync(progress: number) {
    const next = chapterForProgress(progress);
    this.target = next;

    if (this.reducedMotion) {
      if (next !== this.settled) {
        this.snapToChapter(next);
      }
      return;
    }

    this.drive();
  }

  private killTween() {
    this.tween?.kill();
    this.tween = null;
  }

  private remainingDuration(kind: 'exit' | 'enter'): number {
    const el = this.el;
    if (!el) {
      return kind === 'exit' ? EXIT_DURATION : ENTER_DURATION;
    }

    const opacity = Number(gsap.getProperty(el, 'opacity'));
    const base = kind === 'exit' ? EXIT_DURATION : ENTER_DURATION;

    if (kind === 'exit') {
      return Math.max(0.12, base * opacity);
    }

    return Math.max(0.12, base * (1 - opacity));
  }

  private drive() {
    const el = this.el;
    if (!el) return;

    if (this.target === this.settled) {
      if (this.phase === 'exit') {
        this.reverseExit();
        return;
      }

      if (this.phase === 'enter' && this.displayed !== this.settled) {
        this.reverseEnter();
      }
      return;
    }

    if (this.phase === 'idle') {
      this.startExit();
      return;
    }

    if (this.phase === 'enter' && this.target !== this.displayed) {
      this.abortEnterForRetarget();
    }
  }

  private startExit() {
    const el = this.el;
    if (!el) return;

    this.phase = 'exit';
    this.killTween();
    this.tween = gsap.to(el, {
      ...EXIT_TO,
      duration: EXIT_DURATION,
      ease: EASE,
      onComplete: () => {
        this.tween = null;
        this.onExitComplete();
      },
    });
  }

  private reverseExit() {
    const el = this.el;
    if (!el) return;

    this.killTween();
    this.phase = 'idle';
    this.tween = gsap.to(el, {
      ...SETTLED,
      duration: this.remainingDuration('exit'),
      ease: EASE,
      onComplete: () => {
        this.tween = null;
      },
    });
  }

  private reverseEnter() {
    const el = this.el;
    if (!el) return;

    this.killTween();
    this.tween = gsap.to(el, {
      ...ENTER_FROM,
      duration: this.remainingDuration('enter'),
      ease: EASE,
      onComplete: () => {
        this.tween = null;
        this.displayed = this.settled;
        this.onSwap?.(this.settled);
        gsap.set(el, SETTLED);
        this.phase = 'idle';
      },
    });
  }

  private abortEnterForRetarget() {
    const el = this.el;
    if (!el) return;

    this.killTween();
    this.phase = 'exit';
    this.tween = gsap.to(el, {
      ...EXIT_TO,
      duration: this.remainingDuration('enter'),
      ease: EASE,
      onComplete: () => {
        this.tween = null;
        this.onExitComplete();
      },
    });
  }

  private onExitComplete() {
    const el = this.el;
    if (!el) return;

    if (this.target === this.settled) {
      this.displayed = this.settled;
      this.onSwap?.(this.settled);
      gsap.set(el, SETTLED);
      this.phase = 'idle';
      return;
    }

    this.displayed = this.target;
    this.phase = 'enter';
    gsap.set(el, ENTER_FROM);
    this.onSwap?.(this.target);
    this.killTween();
    this.tween = gsap.to(el, {
      ...SETTLED,
      duration: ENTER_DURATION,
      ease: EASE,
      onComplete: () => {
        this.tween = null;
        this.onEnterComplete();
      },
    });
  }

  private onEnterComplete() {
    this.settled = this.displayed;
    this.phase = 'idle';

    if (this.target !== this.settled) {
      this.drive();
    }
  }
}
