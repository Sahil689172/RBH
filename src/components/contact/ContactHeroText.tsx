import TextExplode from '@/components/ui/text-explode';

export function ContactHeroText() {
  return (
    <div className="contact-hero-animated">
      <TextExplode
        text="Visit Us"
        mode="hover"
        className="contact-hero-animated__label contact-hero-animated__interactive"
      />
      <h1 id="contact-hero-title" className="contact-hero-animated__title">
        <TextExplode
          text="Rahi Boot House"
          mode="hover"
          className="contact-hero-animated__title-text contact-hero-animated__interactive"
        />
      </h1>
      <p className="contact-hero-animated__sub">
        <TextExplode
          text="Hazira Chowk, Gwalior — walking with families since 1959."
          mode="hover"
          className="contact-hero-animated__sub-text contact-hero-animated__interactive"
        />
      </p>
    </div>
  );
}
