import { useCallback, useEffect, useId, useRef, type FC } from 'react';

import { cn } from '@/lib/utils';

type MorphTiming = {
  morphTime?: number;
  holdTime?: number;
};

const DEFAULT_MORPH_TIME = 1.5;
const DEFAULT_HOLD_TIME = 0.5;

function useMorphingText(
  texts: string[],
  { morphTime = DEFAULT_MORPH_TIME, holdTime = DEFAULT_HOLD_TIME }: MorphTiming = {},
) {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const holdRef = useRef(holdTime);
  const phaseRef = useRef<'hold' | 'morph'>('hold');
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const showHold = useCallback(
    (index: number) => {
      const current1 = text1Ref.current;
      const current2 = text2Ref.current;
      if (!current1 || !current2 || texts.length === 0) return;

      current1.textContent = texts[index % texts.length];
      current1.style.filter = 'none';
      current1.style.opacity = '100%';
      current2.style.filter = 'none';
      current2.style.opacity = '0%';
    },
    [texts],
  );

  const setStyles = useCallback(
    (fraction: number, index: number) => {
      const current1 = text1Ref.current;
      const current2 = text2Ref.current;
      if (!current1 || !current2 || texts.length === 0) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[index % texts.length];
      current2.textContent = texts[(index + 1) % texts.length];
    },
    [texts],
  );

  useEffect(() => {
    holdRef.current = holdTime;
    phaseRef.current = 'hold';
    morphRef.current = 0;
    textIndexRef.current = 0;
    showHold(0);
  }, [holdTime, texts, showHold]);

  useEffect(() => {
    let animationFrameId = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      if (phaseRef.current === 'hold') {
        showHold(textIndexRef.current);
        holdRef.current -= dt;

        if (holdRef.current <= 0) {
          phaseRef.current = 'morph';
          morphRef.current = 0;
        }
        return;
      }

      morphRef.current += dt;
      const fraction = Math.min(morphRef.current / morphTime, 1);
      setStyles(fraction, textIndexRef.current);

      if (fraction >= 1) {
        textIndexRef.current = (textIndexRef.current + 1) % texts.length;
        holdRef.current = holdTime;
        phaseRef.current = 'hold';
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [holdTime, morphTime, setStyles, showHold, texts]);

  return { text1Ref, text2Ref };
}

export interface MorphingTextProps {
  className?: string;
  texts: string[];
  filterId?: string;
  morphTime?: number;
  holdTime?: number;
}

const Texts: FC<Pick<MorphingTextProps, 'texts' | 'morphTime' | 'holdTime'>> = ({
  texts,
  morphTime,
  holdTime,
}) => {
  const { text1Ref, text2Ref } = useMorphingText(texts, { morphTime, holdTime });

  return (
    <>
      <span
        className="about-morph-layer about-morph-layer--primary"
        ref={text1Ref}
      />
      <span
        className="about-morph-layer about-morph-layer--secondary"
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: FC<{ filterId: string }> = ({ filterId }) => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id={filterId}>
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

export function MorphingText({
  texts,
  className,
  filterId,
  morphTime = DEFAULT_MORPH_TIME,
  holdTime = DEFAULT_HOLD_TIME,
}: MorphingTextProps) {
  const autoId = useId().replace(/:/g, '');
  const resolvedFilterId = filterId ?? `threshold-${autoId}`;

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-screen-md text-center leading-none',
        className,
      )}
      style={{ filter: `url(#${resolvedFilterId}) blur(0.6px)` }}
    >
      <Texts holdTime={holdTime} morphTime={morphTime} texts={texts} />
      <SvgFilters filterId={resolvedFilterId} />
    </div>
  );
}
