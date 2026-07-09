import { Suspense, lazy, useState } from 'react';
import { HeroNav } from './components/HeroNav';
import { HomeSections } from './components/home/HomeSections';
import { Loader } from './components/Loader';

const Hero = lazy(() =>
  import('./components/Hero').then((module) => ({ default: module.Hero })),
);

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
        <Suspense fallback={null}>
          <Hero className={siteReady ? 'site-reveal-main' : undefined} />
        </Suspense>
        <HomeSections />
      </div>
    </>
  );
}
