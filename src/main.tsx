import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { isMobileHeroFrameViewport } from './hero/mobileFrameDraw';
import { setMobileBrandsDock } from './hero/mobileHeroTail';
import { startFramePreload } from './lib/framePreloader';

if (isMobileHeroFrameViewport()) {
  setMobileBrandsDock(true);
}

startFramePreload();

const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
);
