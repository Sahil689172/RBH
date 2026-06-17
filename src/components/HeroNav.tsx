import { useEffect, useRef, useState } from 'react';

import { SITE_TUBELIGHT_ITEMS, TubelightNav } from '@/components/TubelightSiteNav';

type NavKey = (typeof SITE_TUBELIGHT_ITEMS)[number]['nav'];

type HeroNavProps = {
  className?: string;
  activeNav?: NavKey;
};

export function HeroNav({ className = '', activeNav = 'home' }: HeroNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const callRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!callOpen) return;

    const onClick = (e: MouseEvent) => {
      if (callRef.current && !callRef.current.contains(e.target as Node)) {
        setCallOpen(false);
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [callOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      id="navbar"
      className={`navbar scrolled${className ? ` ${className}` : ''}`}
    >
      <div className="navbar-inner">
        <a href="/" className="navbar-logo">
          <span className="logo-name">RAHI BOOT HOUSE</span>
          <span className="logo-tagline">Since 1959</span>
        </a>

        <nav
          className={`navbar-links tubelight-nav${mobileOpen ? ' open' : ''}`}
          id="nav-links"
          aria-label="Main navigation"
        >
          <TubelightNav
            activeNav={activeNav}
            items={SITE_TUBELIGHT_ITEMS}
            onItemClick={closeMobile}
          />
        </nav>

        <div className="navbar-actions">
          <div className="call-dropdown" ref={callRef}>
            <button
              type="button"
              className="btn btn-ghost btn-sm call-trigger"
              aria-expanded={callOpen}
              aria-haspopup="true"
              onClick={() => setCallOpen((open) => !open)}
            >
              Call Now
            </button>
            <div className={`call-menu${callOpen ? ' open' : ''}`} role="menu">
              <a
                href="tel:9826270611"
                className="call-option"
                role="menuitem"
                onClick={() => setCallOpen(false)}
              >
                9826270611
              </a>
              <a
                href="tel:9993325524"
                className="call-option"
                role="menuitem"
                onClick={() => setCallOpen(false)}
              >
                9993325524
              </a>
            </div>
          </div>
          <a
            href="https://wa.me/919826270611"
            className="btn btn-accent btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <button
            type="button"
            className={`hamburger${mobileOpen ? ' open' : ''}`}
            id="hamburger"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
