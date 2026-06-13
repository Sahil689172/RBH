import { useCallback, useEffect, useRef, useState } from 'react';

const LOADER_VIDEO = '/loader.mp4';
const FINAL_FRAME_HOLD_MS = 3000;
const FADE_MS = 1000;
const ERROR_FALLBACK_MS = 8000;

interface LoaderProps {
  onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);
  const finishedRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const finishLoader = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimers();
    onComplete();
  }, [clearTimers, onComplete]);

  const startFadeOut = useCallback(() => {
    if (finishedRef.current) return;
    setFading(true);
    fadeTimerRef.current = window.setTimeout(finishLoader, FADE_MS);
  }, [finishLoader]);

  const handleEnded = useCallback(() => {
    if (finishedRef.current) return;

    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      video.pause();
    }

    holdTimerRef.current = window.setTimeout(startFadeOut, FINAL_FRAME_HOLD_MS);
  }, [startFadeOut]);

  const handleError = useCallback(() => {
    if (finishedRef.current || errorTimerRef.current !== null) return;
    errorTimerRef.current = window.setTimeout(startFadeOut, ERROR_FALLBACK_MS);
  }, [startFadeOut]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      className={`rbh-loader${fading ? ' rbh-loader--fading' : ''}`}
      aria-hidden={fading}
    >
      <video
        ref={videoRef}
        className="rbh-loader__video"
        src={LOADER_VIDEO}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
        onError={handleError}
      />
    </div>
  );
}
