import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { isMobileHeroFrameViewport } from './hero/mobileFrameDraw';
import { setMobileBrandsDock } from './hero/mobileHeroTail';

if (isMobileHeroFrameViewport()) {
  setMobileBrandsDock(true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
