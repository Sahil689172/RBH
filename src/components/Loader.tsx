import { useEffect, useRef, useState } from 'react';
import { AnimatedScanLoader } from '@/components/ui/animated-scan-loader';

const HOLD_MS = 2400;
const FADE_MS = 600;

interface LoaderProps {
  onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const [fading, setFading] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), HOLD_MS);
    const completeTimer = window.setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onComplete();
    }, HOLD_MS + FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`rbh-loader${fading ? ' rbh-loader--fading' : ''}`}
      role="status"
      aria-label="Loading"
    >
      <div className="rbh-loader__inner">
        <AnimatedScanLoader />
        <p className="rbh-loader__tagline">Since 1959</p>
      </div>
    </div>
  );
}
