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
      width="26"
      height="26"
      viewBox="0 0 256 256"
      fill="#ffffff"
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
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        <a href="/" className="flex items-center gap-2.5">
          <BootLogo />
          <span className="text-white text-2xl font-playfair italic">
            Rahi Boot House
          </span>
        </a>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
          {SITE_LINKS.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={
                index === 0
                  ? 'px-4 py-1.5 rounded-full text-sm font-medium text-white'
                  : 'px-4 py-1.5 rounded-full text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors'
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="md:hidden text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <a
            href="/contact/"
            className="hidden md:inline-block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Visit Store
          </a>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[99] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-[72px] left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col gap-1">
            {SITE_LINKS.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className={
                  index === 0
                    ? 'px-4 py-3 rounded-xl text-sm font-medium text-white bg-white/15'
                    : 'px-4 py-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors'
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/contact/"
              className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 bg-white text-center"
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
