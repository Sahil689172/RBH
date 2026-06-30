import { ScrollFrameHero } from './ScrollFrameHero';

type HeroProps = {
  className?: string;
};

export function Hero({ className = '' }: HeroProps) {
  return <ScrollFrameHero className={className} />;
}
