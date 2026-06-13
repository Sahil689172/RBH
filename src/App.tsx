import { useState } from 'react';
import { HeroNav } from './components/HeroNav';
import { Loader } from './components/Loader';

const LOADER_KEY = 'rbh_loader_shown';

function getLoaderSkipped(): boolean {
  try {
    return sessionStorage.getItem(LOADER_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const [loaderSkipped] = useState(getLoaderSkipped);
  const [showLoader, setShowLoader] = useState(() => !getLoaderSkipped());
  const [siteReady, setSiteReady] = useState(() => getLoaderSkipped());

  const handleLoaderComplete = () => {
    try {
      sessionStorage.setItem(LOADER_KEY, '1');
    } catch {
      /* ignore storage errors */
    }
    setShowLoader(false);
    setSiteReady(true);
  };

  return (
    <>
      {showLoader && <Loader onComplete={handleLoaderComplete} />}

      <div
        className={`site-shell min-h-screen bg-[#050505] flex flex-col tracking-[-0.02em]${
          siteReady ? ' site-shell--visible' : ''
        }${loaderSkipped ? ' site-shell--instant' : ''}`}
        style={{ fontFamily: "'Inter', sans-serif", minHeight: '100dvh' }}
      >
        <HeroNav className={siteReady ? 'site-reveal-nav' : undefined} />
        <main
          className={`flex-1 flex items-center justify-center px-6${
            siteReady ? ' site-reveal-main' : ''
          }`}
        >
          <p className="font-display text-[#F5F5F5] text-2xl sm:text-3xl md:text-4xl tracking-[0.08em] uppercase">
            Coming Soon
          </p>
        </main>
      </div>
    </>
  );
}
