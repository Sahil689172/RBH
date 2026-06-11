export function HomeBelowFold() {
  return (
    <>
      <div className="section-divider" aria-hidden="true" />

      <section id="legacy" className="legacy-section">
        <div className="section-container">
          <div className="section-header reveal-item">
            <span className="section-label">Our Legacy</span>
            <h2 className="section-title">Built on Trust</h2>
            <p className="section-subtitle">
              Three generations of footwear expertise, serving families with care
              and quality.
            </p>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <section id="stats" className="stats-section">
        <div className="section-container">
          <div className="trust-grid">
            <article className="trust-card reveal-item">
              <span className="trust-number" data-target="65" data-suffix="+">
                0
              </span>
              <span className="trust-label">Years of Trust</span>
            </article>
            <article className="trust-card reveal-item">
              <span className="trust-number" data-target="10000" data-suffix="+">
                0
              </span>
              <span className="trust-label">Happy Customers</span>
            </article>
            <article className="trust-card reveal-item">
              <span className="trust-number" data-target="14" data-suffix="+">
                0
              </span>
              <span className="trust-label">Trusted Brands</span>
            </article>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <section id="home-brands" className="brands-section">
        <div className="section-container">
          <div className="section-header reveal-item">
            <span className="section-label">Partnerships</span>
            <h2 className="section-title">Brands We Deal In</h2>
            <p className="section-subtitle">
              Partnering with India&apos;s leading footwear brands.
            </p>
          </div>
        </div>

        <div className="marquee-wrap reveal-item" tabIndex={0}>
          <div className="marquee-track">
            <div className="marquee-content">
              {[
                'Campus',
                'Liberty',
                'Paragon',
                'Adda',
                'Welcome',
                'Aerowalk',
                'GND',
                'Red Chief',
                'Mocs',
                'Kats',
                'Bata',
                'Abros',
                'Glamour',
                'Frankie',
                'Lakhani',
                'Spark',
              ].map((brand) => (
                <span key={brand} className="brand-logo">
                  {brand}
                </span>
              ))}
            </div>
            <div className="marquee-content" aria-hidden="true">
              {[
                'Campus',
                'Liberty',
                'Paragon',
                'Adda',
                'Welcome',
                'Aerowalk',
                'GND',
                'Red Chief',
                'Mocs',
                'Kats',
                'Bata',
                'Abros',
                'Glamour',
                'Frankie',
                'Lakhani',
                'Spark',
              ].map((brand) => (
                <span key={`dup-${brand}`} className="brand-logo">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-header reveal-item">
            <span className="section-label">Voices of Trust</span>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>

          <div className="testimonials-grid">
            <blockquote className="testimonial-card reveal-item">
              <p className="testimonial-quote">
                &ldquo;Three generations of our family have trusted Rahi Boot House.
                Quality footwear and honest guidance every time.&rdquo;
              </p>
              <footer className="testimonial-author">
                <span className="testimonial-name">Rajesh Mehta</span>
                <span className="testimonial-meta">Customer since 1998</span>
              </footer>
            </blockquote>

            <blockquote className="testimonial-card reveal-item">
              <p className="testimonial-quote">
                &ldquo;The best selection of school and sports shoes in town. They
                always find the perfect fit for my children.&rdquo;
              </p>
              <footer className="testimonial-author">
                <span className="testimonial-name">Priya Sharma</span>
                <span className="testimonial-meta">Local Parent</span>
              </footer>
            </blockquote>

            <blockquote className="testimonial-card reveal-item">
              <p className="testimonial-quote">
                &ldquo;A heritage store that truly understands footwear. Premium brands,
                fair prices, and warm service.&rdquo;
              </p>
              <footer className="testimonial-author">
                <span className="testimonial-name">Amit Verma</span>
                <span className="testimonial-meta">Regular Customer</span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <section id="home-cta" className="cta-section">
        <div className="cta-glow cta-glow-1" />
        <div className="cta-glow cta-glow-2" />
        <div className="section-container cta-inner reveal-item">
          <span className="section-label">Get in Touch</span>
          <h2 className="cta-title">Looking for the Perfect Pair?</h2>
          <p className="cta-text">
            Visit our store or contact us today for expert footwear recommendations
            tailored to your needs.
          </p>
          <div className="cta-actions">
            <div className="call-dropdown call-dropdown-lg">
              <button
                type="button"
                className="btn btn-primary btn-lg call-trigger"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call Now
              </button>
              <div className="call-menu" role="menu">
                <a href="tel:9826270611" className="call-option" role="menuitem">
                  9826270611
                </a>
                <a href="tel:9993325524" className="call-option" role="menuitem">
                  9993325524
                </a>
              </div>
            </div>
            <a
              href="https://wa.me/919826270611"
              className="btn btn-outline btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-container footer-inner">
          <div className="footer-brand">
            <span className="logo-name">RAHI BOOT HOUSE</span>
            <span className="logo-tagline">Since 1959</span>
          </div>
          <p className="footer-copy">
            &copy; 2026 Rahi Boot House. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
