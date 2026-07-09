/**
 * Collection page — scroll-velocity marquee rows (vanilla port of Framer Motion ScrollVelocity)
 */
(function () {
  'use strict';

  const WRAP_MIN = 0;
  const WRAP_MAX = -50;

  function wrap(min, max, value) {
    const range = max - min;
    return min + ((((value - min) % range) + range) % range);
  }

  function velocityFactorFromScroll(smoothVelocity) {
    return (smoothVelocity / 10000) * 5;
  }

  class ScrollVelocityRow {
    constructor(root) {
      this.root = root;
      this.track = root.querySelector('.scroll-velocity-track');
      if (!this.track) return;

      this.velocity = parseFloat(root.dataset.velocity, 10) || 5;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        this.velocity *= 0.62;
      }
      this.movable = root.dataset.movable !== 'false';
      this.baseX = 0;
      this.directionFactor = 1;
      this.lastScrollY = window.scrollY;
      this.smoothVelocity = 0;
      this.lastTime = performance.now();
      this.scrollThreshold = 5;
      this.visible = true;

      this.duplicateChildren();

      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry.isIntersecting;
        },
        { threshold: 0, rootMargin: '64px 0px' },
      );
      this.observer.observe(this.root);

      this.tick = this.tick.bind(this);
      requestAnimationFrame(this.tick);
    }

    destroy() {
      this.observer?.disconnect();
    }

    duplicateChildren() {
      const children = Array.from(this.track.children);
      children.forEach((child) => {
        const clone = child.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        this.track.appendChild(clone);
      });
    }

    tick(now) {
      if (!this.visible) {
        requestAnimationFrame(this.tick);
        return;
      }

      const delta = Math.min(now - this.lastTime, 64);
      this.lastTime = now;

      const scrollY = window.scrollY;
      const instantVelocity = delta > 0 ? ((scrollY - this.lastScrollY) / delta) * 1000 : 0;
      this.lastScrollY = scrollY;

      const springAlpha = 1 - Math.exp((-100 / 50) * (delta / 1000));
      this.smoothVelocity += (instantVelocity - this.smoothVelocity) * springAlpha;

      const velocityFactor = velocityFactorFromScroll(this.smoothVelocity);

      if (velocityFactor < 0) {
        this.directionFactor = -1;
      } else if (velocityFactor > 0) {
        this.directionFactor = 1;
      }

      let shouldMove = this.movable;
      if (!shouldMove && Math.abs(instantVelocity) >= this.scrollThreshold) {
        shouldMove = true;
      }

      if (shouldMove && delta > 0) {
        let moveBy = this.directionFactor * this.velocity * (delta / 1000);
        moveBy += this.directionFactor * moveBy * velocityFactor;
        this.baseX += moveBy;
      }

      const x = wrap(WRAP_MIN, WRAP_MAX, this.baseX);
      this.track.style.transform = `translate3d(${x}%, 0, 0)`;

      requestAnimationFrame(this.tick);
    }
  }

  function init() {
    if (!document.querySelector('.collection-page')) return;

    document.querySelectorAll('.scroll-velocity').forEach((el) => {
      new ScrollVelocityRow(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
