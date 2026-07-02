import { useEffect, useRef } from 'react';
import { useVisibilityPause } from '../../hooks/useVisibilityPause';

const TESTIMONIALS = [
  {
    name: 'Rajesh Sharma',
    text: "Rahi Boot House has been our family's first choice for footwear for years. Excellent quality and genuine service.",
  },
  {
    name: 'Priya Verma',
    text: 'Bought school shoes for my children here. Great collection and very helpful staff.',
  },
  {
    name: 'Amit Gupta',
    text: 'One of the most trusted footwear stores in Gwalior. Quality products and fair pricing.',
  },
  {
    name: 'Neha Singh',
    text: 'Love the variety of brands available under one roof. Always find exactly what I need.',
  },
  {
    name: 'Sanjay Jain',
    text: 'Excellent customer service and a wonderful shopping experience every time.',
  },
  {
    name: 'Ritu Agrawal',
    text: 'Have been shopping here for years. The quality and trust remain unchanged.',
  },
] as const;

function TestimonialCard({
  name,
  text,
  className = '',
  hidden = false,
}: {
  name: string;
  text: string;
  className?: string;
  hidden?: boolean;
}) {
  return (
    <article
      className={`home-testimonial-card ${className}`.trim()}
      aria-hidden={hidden || undefined}
    >
      <h3 className="home-testimonial-name">{name}</h3>
      <div className="home-testimonial-stars" aria-label="5 out of 5 stars">
        <span aria-hidden="true">★★★★★</span>
      </div>
      <p className="home-testimonial-text">&ldquo;{text}&rdquo;</p>
    </article>
  );
}

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useVisibilityPause(carouselRef, '.home-testimonial-track');

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>('.home-testimonial-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="home-testimonials-section"
      aria-labelledby="home-testimonials-title"
    >
      <div className="home-section-header reveal-item">
        <span className="home-section-label">✦ GENERATIONS OF TRUST ✦</span>
        <h2 id="home-testimonials-title" className="home-section-title">
          What Our Customers Say
        </h2>
      </div>

      <div
        ref={carouselRef}
        className="home-testimonial-carousel"
        aria-label="Customer testimonials"
      >
        <div className="home-testimonial-track">
          {TESTIMONIALS.map((item) => (
            <TestimonialCard
              key={item.name}
              name={item.name}
              text={item.text}
              className="home-testimonial-reveal"
            />
          ))}
          {TESTIMONIALS.map((item) => (
            <TestimonialCard
              key={`dup-${item.name}`}
              name={item.name}
              text={item.text}
              hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}
