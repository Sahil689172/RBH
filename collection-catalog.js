/**
 * Collection page — leather shoe product catalog + fullscreen gallery
 */
(function () {
  'use strict';

  const CATALOG_URL = '/leather-shoes-catalog.json';
  const FADE_MS = 300;
  const SIZES = [8, 9, 10, 11, 12];
  const SWIPE_THRESHOLD = 48;

  let products = [];
  let galleryIndex = -1;
  let galleryImageIndex = 0;
  let galleryOpen = false;
  let touchStartX = 0;
  let touchStartY = 0;
  const loadedGalleryImages = new Map();

  const els = {
    grid: null,
    gallery: null,
    backdrop: null,
    panel: null,
    stage: null,
    imageA: null,
    imageB: null,
    imageActive: 'a',
    title: null,
    subtitle: null,
    price: null,
    counter: null,
    prev: null,
    next: null,
    close: null,
  };

  const CARD_TITLE = 'RBH Signature Collection';
  const CARD_SUBTITLE = 'Premium Leather Footwear';

  function productIdFor(product) {
    return `RBH-LS-${String(product.number).padStart(3, '0')}`;
  }

  function productNameFor() {
    return 'Premium Leather Collection';
  }

  function formatPrice(value) {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getActiveImageEl() {
    return els.imageActive === 'a' ? els.imageA : els.imageB;
  }

  function getIdleImageEl() {
    return els.imageActive === 'a' ? els.imageB : els.imageA;
  }

  function renderSizePills() {
    return SIZES.map(
      (size) => `<span class="leather-size-pill">${size}</span>`,
    ).join('');
  }

  function loadImage(src) {
    if (loadedGalleryImages.has(src)) {
      return loadedGalleryImages.get(src);
    }

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    loadedGalleryImages.set(src, promise);
    return promise;
  }

  async function probeImage(url) {
    const loaded = await loadImage(url);
    return Boolean(loaded);
  }

  function preferA1Thumbnail(images) {
    if (!images?.length) return null;
    return images.find((url) => /\/a1\.[^/]+$/i.test(decodeURIComponent(url))) ?? images[0];
  }

  async function resolveGalleryImages(product) {
    if (product.images.length >= 3) return product.images.slice(0, 3);

    const thumb = product.thumbnail;
    const folderUrl = thumb.slice(0, thumb.lastIndexOf('/') + 1);
    const resolved = [];
    const extensions = ['.jpeg', '.jpg', '.JPEG', '.JPG', '.png', '.webp'];

    for (let i = 1; i <= 3; i += 1) {
      let matched = null;

      for (const ext of extensions) {
        const names = [`A${i}${ext}`, `a${i}${ext}`];
        for (const name of names) {
          const url = folderUrl + encodeURIComponent(name);
          if (await probeImage(url)) {
            matched = url;
            break;
          }
        }
        if (matched) break;
      }

      if (matched) resolved.push(matched);
    }

    if (resolved.length >= 3) return resolved.slice(0, 3);

    for (const url of product.images) {
      if (!resolved.includes(url)) resolved.push(url);
      if (resolved.length >= 3) break;
    }

    return resolved.length ? resolved.slice(0, 3) : product.images;
  }

  function preloadAdjacent(product) {
    if (!product?.images?.length) return;
    const next =
      product.images[(galleryImageIndex + 1) % product.images.length];
    const prev =
      product.images[
        (galleryImageIndex - 1 + product.images.length) % product.images.length
      ];
    if (next) loadImage(next);
    if (prev) loadImage(prev);
  }

  function renderGrid() {
    if (!els.grid) return;

    if (!products.length) {
      els.grid.innerHTML =
        '<p class="leather-catalog-empty">New leather styles arriving soon.</p>';
      return;
    }

    els.grid.innerHTML = products
      .map((product, index) => {
        return `
      <article
        class="leather-product-card"
        data-product-index="${index}"
        data-product-id="${escapeHtml(productIdFor(product))}"
        data-product-folder="${escapeHtml(product.folder)}"
        data-product-price="${product.price}"
        data-product-name="${escapeHtml(productNameFor())}"
        tabindex="0"
        role="button"
        aria-label="View ${escapeHtml(CARD_TITLE)}, ${formatPrice(product.price)}"
      >
        <div class="leather-product-card__media">
          <img
            src="${escapeHtml(product.thumbnail)}"
            alt="${escapeHtml(CARD_TITLE)}"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="leather-product-card__body">
          <h3 class="leather-product-card__title">${escapeHtml(CARD_TITLE)}</h3>
          <p class="leather-product-card__subtitle">${escapeHtml(CARD_SUBTITLE)}</p>
          <p class="leather-product-card__price">${formatPrice(product.price)}</p>
          <div class="leather-product-card__sizes">
            <p class="leather-product-card__sizes-label">Available Sizes</p>
            <div class="leather-size-pills" aria-hidden="true">
              ${renderSizePills()}
            </div>
          </div>
          <button type="button" class="leather-buy-now" data-buy-now>
            Buy Now
          </button>
          <span class="leather-product-card__cta">View Gallery &rarr;</span>
        </div>
      </article>
    `;
      })
      .join('');
  }

  function updateGalleryMeta(product) {
    els.title.textContent = CARD_TITLE;
    if (els.subtitle) els.subtitle.textContent = CARD_SUBTITLE;
    els.price.textContent = formatPrice(product.price);
    els.counter.textContent = `${galleryImageIndex + 1} / ${product.images.length}`;
    const hasMultiple = product.images.length > 1;
    els.prev.disabled = !hasMultiple;
    els.next.disabled = !hasMultiple;
  }

  async function setGalleryImage(src, { animate = true } = {}) {
    const product = products[galleryIndex];
    if (!product || !src) return;

    const loaded = await loadImage(src);
    if (!loaded) return;

    const active = getActiveImageEl();
    const idle = getIdleImageEl();
    const hasCurrent = Boolean(active.getAttribute('src'));

    if (!animate || !hasCurrent) {
      active.src = src;
      active.classList.add('is-visible');
      idle.classList.remove('is-visible');
      idle.removeAttribute('src');
      els.imageActive = active === els.imageA ? 'a' : 'b';
      updateGalleryMeta(product);
      preloadAdjacent(product);
      return;
    }

    idle.src = src;
    idle.classList.add('is-visible');
    active.classList.remove('is-visible');
    els.imageActive = idle === els.imageA ? 'a' : 'b';
    updateGalleryMeta(product);
    preloadAdjacent(product);

    window.setTimeout(() => {
      if (!active.classList.contains('is-visible')) {
        active.removeAttribute('src');
      }
    }, FADE_MS);
  }

  async function openGallery(productIndex) {
    const product = products[productIndex];
    if (!product || !product.images?.length) return;

    if (!product._galleryResolved) {
      // Production-safe: rely on catalog JSON image list only.
      if (product.images.length < 3) product.images = await resolveGalleryImages(product);
      product._galleryResolved = true;
    }

    if (!product.images.length) return;

    galleryIndex = productIndex;
    galleryImageIndex = 0;
    galleryOpen = true;

    document.body.classList.add('leather-gallery-open');
    els.gallery.hidden = false;
    els.gallery.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      els.gallery.classList.add('is-open');
    });

    await setGalleryImage(product.images[0], { animate: false });
    els.close.focus();
  }

  function closeGallery() {
    if (!galleryOpen) return;

    galleryOpen = false;
    galleryIndex = -1;
    galleryImageIndex = 0;

    els.gallery.classList.remove('is-open');
    els.gallery.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('leather-gallery-open');

    window.setTimeout(() => {
      if (!galleryOpen) {
        els.gallery.hidden = true;
        getActiveImageEl().removeAttribute('src');
        getIdleImageEl().removeAttribute('src');
        getActiveImageEl().classList.remove('is-visible');
        getIdleImageEl().classList.remove('is-visible');
      }
    }, FADE_MS);
  }

  async function stepGallery(delta) {
    const product = products[galleryIndex];
    if (!product || product.images.length <= 1) return;

    galleryImageIndex =
      (galleryImageIndex + delta + product.images.length) % product.images.length;

    await setGalleryImage(product.images[galleryImageIndex], { animate: true });
  }

  function openFromCard(card) {
    if (!card) return;
    const index = Number.parseInt(card.dataset.productIndex, 10);
    if (!Number.isNaN(index)) openGallery(index);
  }

  function bindEvents() {
    els.grid.addEventListener('click', (event) => {
      if (event.target.closest('[data-buy-now]')) return;
      openFromCard(event.target.closest('.leather-product-card'));
    });

    els.grid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (event.target.closest('[data-buy-now]')) return;
      const card = event.target.closest('.leather-product-card');
      if (!card) return;
      event.preventDefault();
      openFromCard(card);
    });

    els.close.addEventListener('click', closeGallery);
    els.backdrop.addEventListener('click', closeGallery);
    els.panel.addEventListener('click', (event) => event.stopPropagation());

    els.prev.addEventListener('click', () => stepGallery(-1));
    els.next.addEventListener('click', () => stepGallery(1));

    els.stage.addEventListener(
      'touchstart',
      (event) => {
        if (!galleryOpen || event.touches.length !== 1) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true },
    );

    els.stage.addEventListener(
      'touchend',
      (event) => {
        if (!galleryOpen || event.changedTouches.length !== 1) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (Math.abs(deltaX) < Math.abs(deltaY)) return;
        stepGallery(deltaX < 0 ? 1 : -1);
      },
      { passive: true },
    );

    document.addEventListener('keydown', (event) => {
      if (!galleryOpen) return;
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft') stepGallery(-1);
      if (event.key === 'ArrowRight') stepGallery(1);
    });
  }

  function mountGallery() {
    const root = document.getElementById('leather-gallery-root');
    if (!root) return;

    root.innerHTML = `
      <div class="leather-gallery" id="leather-gallery" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Product gallery">
        <div class="leather-gallery__backdrop" data-gallery-backdrop></div>
        <div class="leather-gallery__panel" data-gallery-panel>
          <button type="button" class="leather-gallery__close" data-gallery-close aria-label="Close gallery">&times;</button>
          <div class="leather-gallery__stage" data-gallery-stage>
            <button type="button" class="leather-gallery__nav leather-gallery__nav--prev" data-gallery-prev aria-label="Previous image">&#8592;</button>
            <div class="leather-gallery__image-wrap">
              <img class="leather-gallery__image is-visible" data-gallery-image-a alt="" decoding="async" />
              <img class="leather-gallery__image" data-gallery-image-b alt="" decoding="async" />
            </div>
            <button type="button" class="leather-gallery__nav leather-gallery__nav--next" data-gallery-next aria-label="Next image">&#8594;</button>
          </div>
          <div class="leather-gallery__meta">
            <h3 class="leather-gallery__title" data-gallery-title>RBH Signature Collection</h3>
            <p class="leather-gallery__subtitle" data-gallery-subtitle>Premium Leather Footwear</p>
            <p class="leather-gallery__price" data-gallery-price></p>
            <p class="leather-gallery__counter" data-gallery-counter>1 / 3</p>
          </div>
        </div>
      </div>
    `;

    els.gallery = root.querySelector('#leather-gallery');
    els.backdrop = root.querySelector('[data-gallery-backdrop]');
    els.panel = root.querySelector('[data-gallery-panel]');
    els.stage = root.querySelector('[data-gallery-stage]');
    els.imageA = root.querySelector('[data-gallery-image-a]');
    els.imageB = root.querySelector('[data-gallery-image-b]');
    els.title = root.querySelector('[data-gallery-title]');
    els.subtitle = root.querySelector('[data-gallery-subtitle]');
    els.price = root.querySelector('[data-gallery-price]');
    els.counter = root.querySelector('[data-gallery-counter]');
    els.prev = root.querySelector('[data-gallery-prev]');
    els.next = root.querySelector('[data-gallery-next]');
    els.close = root.querySelector('[data-gallery-close]');
  }

  function initCatalogIntroReveal() {
    const intro = document.querySelector('[data-catalog-intro]');
    if (!intro) return;

    const reveal = () => intro.classList.add('is-visible');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -32px 0px' },
    );

    observer.observe(intro);
  }

  function initCatalogOutroReveal() {
    const outro = document.querySelector('[data-catalog-outro]');
    if (!outro) return;

    const reveal = () => outro.classList.add('is-visible');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(outro);
  }

  async function init() {
    if (!document.querySelector('.collection-page')) return;

    els.grid = document.getElementById('leather-catalog-grid');
    if (!els.grid) return;

    mountGallery();
    bindEvents();

    try {
      const response = await fetch(CATALOG_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Catalog unavailable');
      const data = await response.json();
      products = Array.isArray(data.products) ? data.products : [];

      // Production-safe: thumbnails and images come from the generated catalog JSON.
      // Ensure we keep a stable 3-image gallery preview when possible.
      products.forEach((product) => {
        if (Array.isArray(product.images) && product.images.length) {
          product.images = product.images.slice(0, 3);
          const thumb = preferA1Thumbnail(product.images);
          if (thumb) product.thumbnail = thumb;
        }
      });
    } catch {
      products = [];
    }

    renderGrid();
    initCatalogIntroReveal();
    initCatalogOutroReveal();
    document.dispatchEvent(new CustomEvent('rbh:catalog-ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
