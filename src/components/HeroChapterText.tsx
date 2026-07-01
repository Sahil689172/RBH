import { memo } from 'react';
import type { HeroChapter } from './heroChapters';

type HeroChapterTextProps = {
  chapter: HeroChapter;
};

function HeroChapterTextComponent({ chapter }: HeroChapterTextProps) {
  return (
    <>
      <div className="hero-text-slot hero-text-slot--heading">
        <h1 className="hero-lux-heading scroll-hero-heading" aria-label={chapter.headingAria}>
          {chapter.heading}
        </h1>
      </div>

      <div className="hero-text-slot hero-text-slot--gold">
        <p className="hero-lux-since scroll-hero-gold">{chapter.gold}</p>
      </div>

      <div className="hero-text-slot hero-text-slot--description">
        <p className="hero-lux-supporting scroll-hero-description">{chapter.description}</p>
      </div>
    </>
  );
}

export const HeroChapterText = memo(HeroChapterTextComponent);
export default HeroChapterText;
