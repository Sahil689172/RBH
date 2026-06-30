/**
 * Collection page — leather shoe product catalog + fullscreen gallery
 */
(function () {
  'use strict';

  const CATALOG_URL = '/leather-shoes-catalog.json';
  const FADE_MS = 300;

  let products = [];
  let galleryIndex = -1;
  let galleryImageIndex = 0;
  let galleryOpen = false;
  let transitionTimer = 0;

  const els = {
    grid: null,
    gallery: null,
    backdrop: null,
    panel: null,
    imageA: null,
    imageB: null,
    imageActive: 'a',
    title: null,
    price: null,
    counter: null,
    prev: null,
    next: null,
    close: null,
  };

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

  function preloadImages(imageUrls) {
    imageUrls.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }

  function renderGrid() {
    if (!els.grid) return;

    if (!products.length) {
      els.grid.innerHTML =
        '<p class="leather-catalog-empty">New leather styles arriving soon.</p>';
      return;
    }

    els.grid.innerHTML = products
      .map(
        (product, index) => `
      <article class="leather-product-card" data-product-index="${index}" tabindex="0" role="button" aria-label="View leather shoe, ${formatPrice(product.price)}">
        <div class="leather-product-card__media">
          <img
            src="${escapeHtml(product.thumbnail)}"
            alt="Leather Shoe"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="leather-product-card__body">
          <h3 class="leather-product-card__title">Leather Shoe</h3>
          <p class="leather-product-card__price">${formatPrice(product.price)}</p>
        </div>
      </article>
    `,
      )
      .join('');
  }

  function updateGalleryMeta(product) {
    els.title.textContent = 'Leather Shoe';
    els.price.textContent = formatPrice(product.price);
    els.counter.textContent = `${galleryImageIndex + 1} / ${product.images.length}`;
  }

  function setGalleryImage(src, { animate = true } = {}) {
    const product = products[galleryIndex];
    if (!product) return;

    const active = getActiveImageEl();
    const idle = getIdleImageEl();

    if (!animate || !active.src) {
      active.src = src;
      active.classList.add('is-visible');
      idle.classList.remove('is-visible');
      els.imageActive = active === els.imageA ? 'a' : 'b';
      updateGalleryMeta(product);
      return;
    }

    idle.src = src;
    idle.classList.add('is-visible');
    active.classList.remove('is-visible');
    els.imageActive = idle === els.imageA ? 'a' : 'b';
    updateGalleryMeta(product);
  }

  function openGallery(productIndex) {
    const product = products[productIndex];
    if (!product) return;

    galleryIndex = productIndex;
    galleryImageIndex = 0;
    galleryOpen = true;

    document.body.classList.add('leather-gallery-open');
    els.gallery.hidden = false;
    els.gallery.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      els.gallery.classList.add('is-open');
    });

    setGalleryImage(product.images[0], { animate: false });
    preloadImages(product.images);
    els.prev.disabled = product.images.length <= 1;
    els.next.disabled = product.images.length <= 1;
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

    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      if (!galleryOpen) {
        els.gallery.hidden = true;
        getActiveImageEl().removeAttribute('src');
        getIdleImageEl().removeAttribute('src');
      }
    }, FADE_MS);
  }

  function stepGallery(delta) {
    const product = products[galleryIndex];
    if (!product || product.images.length <= 1) return;

    galleryImageIndex =
      (galleryImageIndex + delta + product.images.length) % product.images.length;

    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      setGalleryImage(product.images[galleryImageIndex], { animate: true });
    }, 0);
  }

  function bindEvents() {
    els.grid.addEventListener('click', (event) => {
      const card = event.target.closest('.leather-product-card');
      if (!card) return;
      const index = Number.parseInt(card.dataset.productIndex, 10);
      if (!Number.isNaN(index)) openGallery(index);
    });

    els.grid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.leather-product-card');
      if (!card) return;
      event.preventDefault();
      const index = Number.parseInt(card.dataset.productIndex, 10);
      if (!Number.isNaN(index)) openGallery(index);
    });

    els.close.addEventListener('click', closeGallery);
    els.backdrop.addEventListener('click', closeGallery);
    els.panel.addEventListener('click', (event) => event.stopPropagation());

    els.prev.addEventListener('click', () => stepGallery(-1));
    els.next.addEventListener('click', () => stepGallery(1));

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
          <div class="leather-gallery__stage">
            <button type="button" class="leather-gallery__nav leather-gallery__nav--prev" data-gallery-prev aria-label="Previous image">&#8592;</button>
            <div class="leather-gallery__image-wrap">
              <img class="leather-gallery__image is-visible" data-gallery-image-a alt="" decoding="async" />
              <img class="leather-gallery__image" data-gallery-image-b alt="" decoding="async" />
            </div>
            <button type="button" class="leather-gallery__nav leather-gallery__nav--next" data-gallery-next aria-label="Next image">&#8594;</button>
          </div>
          <div class="leather-gallery__meta">
            <h3 class="leather-gallery__title" data-gallery-title>Leather Shoe</h3>
            <p class="leather-gallery__price" data-gallery-price></p>
            <p class="leather-gallery__counter" data-gallery-counter>1 / 3</p>
          </div>
        </div>
      </div>
    `;

    els.gallery = root.querySelector('#leather-gallery');
    els.backdrop = root.querySelector('[data-gallery-backdrop]');
    els.panel = root.querySelector('[data-gallery-panel]');
    els.imageA = root.querySelector('[data-gallery-image-a]');
    els.imageB = root.querySelector('[data-gallery-image-b]');
    els.title = root.querySelector('[data-gallery-title]');
    els.price = root.querySelector('[data-gallery-price]');
    els.counter = root.querySelector('[data-gallery-counter]');
    els.prev = root.querySelector('[data-gallery-prev]');
    els.next = root.querySelector('[data-gallery-next]');
    els.close = root.querySelector('[data-gallery-close]');
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
    } catch {
      products = [];
    }

    renderGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
