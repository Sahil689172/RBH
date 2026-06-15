import '../../home-sections.css';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { BrandsMarqueeSection } from './BrandsMarqueeSection';
import { TestimonialsSection } from './TestimonialsSection';
import { TrustStatementSection } from './TrustStatementSection';

export function HomeSections() {
  useScrollReveal();

  return (
    <main className="site-main">
      <BrandsMarqueeSection />
      <TestimonialsSection />
      <TrustStatementSection />
    </main>
  );
}
