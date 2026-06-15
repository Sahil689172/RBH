import { useState } from 'react';
import { Hero } from './components/Hero';
import { HeroNav } from './components/HeroNav';
import { HomeSections } from './components/home/HomeSections';
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
        className={`site-shell${
          siteReady ? ' site-shell--visible' : ''
        }${loaderSkipped ? ' site-shell--instant' : ''}`}
      >
        <HeroNav
          className={siteReady ? 'site-reveal-nav' : undefined}
          activeNav="home"
        />
        <Hero className={siteReady ? 'site-reveal-main' : undefined} />
        <HomeSections />
      </div>
    </>
  );
}
