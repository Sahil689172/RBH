import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import TextInertia from '@/components/ui/text-inertia';

import '@/index.css';

const TIMELINE_PARAGRAPH_SELECTOR = '.about-page .timeline-card-body > p';

function mountTimelineText() {
  const paragraphs = document.querySelectorAll<HTMLParagraphElement>(TIMELINE_PARAGRAPH_SELECTOR);

  paragraphs.forEach((paragraph) => {
    const text = paragraph.textContent?.trim();
    if (!text) return;

    const isValues = paragraph.classList.contains('timeline-card-values');
    const isClosing = paragraph.classList.contains('timeline-card-closing');

    const mountNode = document.createElement('div');
    mountNode.className = paragraph.className;
    paragraph.replaceWith(mountNode);

    const root = createRoot(mountNode);
    root.render(
      <StrictMode>
        <TextInertia
          aria-label={text}
          className={
            isValues
              ? 'about-timeline-inertia about-timeline-inertia--values'
              : isClosing
                ? 'about-timeline-inertia about-timeline-inertia--closing'
                : 'about-timeline-inertia'
          }
          intensity={isValues || isClosing ? 1.6 : 1.35}
          text={text}
        />
      </StrictMode>,
    );
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountTimelineText);
} else {
  mountTimelineText();
}
