import { useEffect, useState } from 'react';
import { DesktopHero } from './DesktopHero';
import { MobileHero } from './MobileHero';

type HeroProps = {
  className?: string;
};

function readIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}

export function Hero({ className = '' }: HeroProps) {
  const [isMobile, setIsMobile] = useState(readIsMobile);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);

    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (isMobile) {
    return <MobileHero className={className} />;
  }

  return <DesktopHero className={className} />;
}
