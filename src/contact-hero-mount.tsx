import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ContactHeroText } from '@/components/contact/ContactHeroText';
import './index.css';

const root = document.getElementById('contact-hero-root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <ContactHeroText />
    </StrictMode>,
  );
}
