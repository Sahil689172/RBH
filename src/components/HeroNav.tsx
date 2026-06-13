import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const SITE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Brands', href: '/brands/' },
  { label: 'Collection', href: '/collection/' },
  { label: 'Contact', href: '/contact/' },
] as const;

function BootLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 256 256"
      fill="#D4AF37"
      aria-hidden="true"
    >
      <path d="M48 176c0-44 28-80 64-88 8-36 44-64 88-64 4 0 8 0 12 1-8 28-32 52-60 60-4 36-40 64-84 64-8 0-16-1-20-3zm32-8c32 0 56-24 60-56-24 8-44 28-52 52-4 2-8 4-8 4z" />
      <path d="M72 192h128c8 0 16-4 20-12l16-40c4-12-4-24-16-24H88c-12 0-20 12-16 24l16 40c4 8 12 12 20 12z" />
    </svg>
  );
}

export function HeroNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="hero-nav fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4 sm:py-5">
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <BootLogo />
          <span className="text-[#F5F5F5] text-lg sm:text-xl font-playfair italic tracking-[-0.01em]">
            Rahi Boot House
          </span>
        </a>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 lg:gap-10">
          {SITE_LINKS.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={`hero-nav-link${index === 0 ? ' hero-nav-link--active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden text-[#F5F5F5] p-2 transition-colors hover:text-[#D4AF37]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>

          <a
            href="/contact/"
            className="hero-nav-cta hidden md:inline-block px-5 py-2 rounded-sm"
          >
            Visit Store
          </a>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[99] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="hero-mobile-menu absolute top-[68px] left-4 right-4 rounded-sm p-5 flex flex-col gap-4">
            {SITE_LINKS.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className={`hero-mobile-link py-1${index === 0 ? ' hero-mobile-link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/contact/"
              className="hero-nav-cta mt-2 px-5 py-2.5 rounded-sm text-center"
              onClick={() => setMobileOpen(false)}
            >
              Visit Store
            </a>
          </div>
        </div>
      )}
    </>
  );
}
