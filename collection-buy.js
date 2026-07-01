/**
 * Collection page — premium Buy Now order flow
 */
(function () {
  'use strict';

  const MODAL_MS = 350;
  const SHOE_SIZES = [8, 9, 10, 11, 12];

  const els = {
    root: null,
    grid: null,
    orderModal: null,
    orderBackdrop: null,
    orderPanel: null,
    orderForm: null,
    orderFeedback: null,
    orderClose: null,
    submitBtn: null,
    successModal: null,
    successBackdrop: null,
    successPanel: null,
    successClose: null,
    successReturn: null,
  };

  let orderOpen = false;
  let successOpen = false;
  let activeProduct = null;
  let isSubmitting = false;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatPrice(value) {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  }

  function lockBody() {
    document.body.classList.add('leather-buy-open');
  }

  function unlockBody() {
    if (!orderOpen && !successOpen) {
      document.body.classList.remove('leather-buy-open');
    }
  }

  function productFromCard(card) {
    if (!card) return null;
    return {
      productId: card.dataset.productId || '',
      productFolder: card.dataset.productFolder || '',
      price: Number(card.dataset.productPrice) || 0,
      productName: card.dataset.productName || '',
    };
  }

  function renderSizeOptions(selected) {
    const placeholder = '<option value="" disabled selected hidden>Select size</option>';
    const options = SHOE_SIZES.map(
      (size) =>
        `<option value="${size}"${String(selected) === String(size) ? ' selected' : ''}>${size}</option>`,
    ).join('');
    return placeholder + options;
  }

  function mountModals() {
    const root = document.getElementById('leather-buy-root');
    if (!root) return;

    root.innerHTML = `
      <div class="leather-buy-order" id="leather-buy-order" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="leather-buy-order-title">
        <div class="leather-buy-order__backdrop" data-buy-order-backdrop></div>
        <div class="leather-buy-order__panel" data-buy-order-panel>
          <button type="button" class="leather-buy-order__close" data-buy-order-close aria-label="Close order form">&times;</button>
          <header class="leather-buy-order__head">
            <span class="leather-buy-order__label">✦ RAHI BOOT HOUSE ✦</span>
            <h2 class="leather-buy-order__title" id="leather-buy-order-title">Complete Your Order</h2>
            <p class="leather-buy-order__product" data-buy-order-product></p>
            <p class="leather-buy-order__price" data-buy-order-price></p>
          </header>
          <form class="leather-buy-order__form" id="leather-buy-form" novalidate>
            <input type="hidden" name="productId" data-buy-field="productId" />
            <input type="hidden" name="productFolder" data-buy-field="productFolder" />
            <input type="hidden" name="price" data-buy-field="price" />
            <input type="hidden" name="productName" data-buy-field="productName" />
            <input type="hidden" name="timestamp" data-buy-field="timestamp" />

            <div class="leather-buy-field">
              <label for="leather-buy-name">Customer Name <span aria-hidden="true">*</span></label>
              <input type="text" id="leather-buy-name" name="customerName" required autocomplete="name" placeholder="Your full name" />
            </div>

            <div class="leather-buy-field">
              <label for="leather-buy-phone">Phone Number <span aria-hidden="true">*</span></label>
              <input type="tel" id="leather-buy-phone" name="phone" required autocomplete="tel" inputmode="tel" placeholder="10-digit mobile number" />
            </div>

            <div class="leather-buy-field">
              <label for="leather-buy-address">Full Address <span aria-hidden="true">*</span></label>
              <textarea id="leather-buy-address" name="address" rows="3" required placeholder="House no., street, landmark"></textarea>
            </div>

            <div class="leather-buy-field-row">
              <div class="leather-buy-field">
                <label for="leather-buy-city">City <span aria-hidden="true">*</span></label>
                <input type="text" id="leather-buy-city" name="city" required autocomplete="address-level2" placeholder="City" />
              </div>
              <div class="leather-buy-field">
                <label for="leather-buy-state">State <span aria-hidden="true">*</span></label>
                <input type="text" id="leather-buy-state" name="state" required autocomplete="address-level1" placeholder="State" />
              </div>
            </div>

            <div class="leather-buy-field-row">
              <div class="leather-buy-field">
                <label for="leather-buy-pincode">PIN Code <span aria-hidden="true">*</span></label>
                <input type="text" id="leather-buy-pincode" name="pincode" required inputmode="numeric" autocomplete="postal-code" placeholder="6-digit PIN" maxlength="6" />
              </div>
              <div class="leather-buy-field">
                <label for="leather-buy-size">Shoe Size <span aria-hidden="true">*</span></label>
                <select id="leather-buy-size" name="shoeSize" required>
                  ${renderSizeOptions('')}
                </select>
              </div>
            </div>

            <div class="leather-buy-field">
              <label for="leather-buy-email">Email <span class="leather-buy-optional">(Optional)</span></label>
              <input type="email" id="leather-buy-email" name="email" autocomplete="email" placeholder="you@example.com" />
            </div>

            <button type="submit" class="leather-buy-submit">Submit Order Request</button>
            <p class="leather-buy-feedback" id="leather-buy-feedback" role="alert" aria-live="polite"></p>
          </form>
        </div>
      </div>

      <div class="leather-buy-success" id="leather-buy-success" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="leather-buy-success-title">
        <div class="leather-buy-success__backdrop" data-buy-success-backdrop></div>
        <div class="leather-buy-success__panel" data-buy-success-panel>
          <div class="leather-buy-success__icon" aria-hidden="true">✓</div>
          <h2 class="leather-buy-success__title" id="leather-buy-success-title">Order Request Received</h2>
          <div class="leather-buy-success__message">
            <p>Thank you for choosing Rahi Boot House.</p>
            <p>Your enquiry has been successfully submitted.</p>
            <p>Someone from our team will contact you soon to confirm your order details, product availability, and delivery information.</p>
            <p>Thank you for placing your trust in us.</p>
          </div>
          <div class="leather-buy-success__actions">
            <button type="button" class="leather-buy-success__btn leather-buy-success__btn--primary" data-buy-success-return>
              Return to Collection
            </button>
            <button type="button" class="leather-buy-success__btn leather-buy-success__btn--secondary" data-buy-success-close>
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    els.root = root;
    els.orderModal = root.querySelector('#leather-buy-order');
    els.orderBackdrop = root.querySelector('[data-buy-order-backdrop]');
    els.orderPanel = root.querySelector('[data-buy-order-panel]');
    els.orderForm = root.querySelector('#leather-buy-form');
    els.orderFeedback = root.querySelector('#leather-buy-feedback');
    els.orderClose = root.querySelector('[data-buy-order-close]');
    els.submitBtn = root.querySelector('.leather-buy-submit');
    els.successModal = root.querySelector('#leather-buy-success');
    els.successBackdrop = root.querySelector('[data-buy-success-backdrop]');
    els.successPanel = root.querySelector('[data-buy-success-panel]');
    els.successClose = root.querySelector('[data-buy-success-close]');
    els.successReturn = root.querySelector('[data-buy-success-return]');
  }

  function setHiddenProductFields(product) {
    els.orderForm.querySelector('[data-buy-field="productId"]').value = product.productId;
    els.orderForm.querySelector('[data-buy-field="productFolder"]').value = product.productFolder;
    els.orderForm.querySelector('[data-buy-field="price"]').value = String(product.price);
    els.orderForm.querySelector('[data-buy-field="productName"]').value = product.productName;
    els.orderForm.querySelector('[data-buy-field="timestamp"]').value = '';
  }

  function clearFeedback() {
    els.orderFeedback.textContent = '';
    els.orderFeedback.className = 'leather-buy-feedback';
  }

  function showFeedback(message) {
    els.orderFeedback.textContent = message;
    els.orderFeedback.className = 'leather-buy-feedback leather-buy-feedback--error';
  }

  function resetForm() {
    els.orderForm.reset();
    const sizeSelect = els.orderForm.querySelector('#leather-buy-size');
    if (sizeSelect) {
      sizeSelect.innerHTML = renderSizeOptions('');
    }
    clearFeedback();
    if (activeProduct) {
      setHiddenProductFields(activeProduct);
    }
  }

  function openOrderModal(product) {
    if (!els.orderModal || !product) return;

    activeProduct = product;
    resetForm();

    const productLine = els.orderModal.querySelector('[data-buy-order-product]');
    const priceLine = els.orderModal.querySelector('[data-buy-order-price]');
    if (productLine) productLine.textContent = product.productName;
    if (priceLine) priceLine.textContent = formatPrice(product.price);

    setHiddenProductFields(product);

    orderOpen = true;
    lockBody();
    els.orderModal.hidden = false;
    els.orderModal.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      els.orderModal.classList.add('is-open');
    });

    const firstField = els.orderForm.querySelector('#leather-buy-name');
    if (firstField) window.setTimeout(() => firstField.focus(), MODAL_MS);
  }

  function closeOrderModal() {
    if (!orderOpen || !els.orderModal) return;

    orderOpen = false;
    els.orderModal.classList.remove('is-open');
    els.orderModal.setAttribute('aria-hidden', 'true');

    window.setTimeout(() => {
      if (!orderOpen) {
        els.orderModal.hidden = true;
        activeProduct = null;
        unlockBody();
      }
    }, MODAL_MS);
  }

  function openSuccessModal() {
    if (!els.successModal) return;

    successOpen = true;
    lockBody();
    els.successModal.hidden = false;
    els.successModal.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      els.successModal.classList.add('is-open');
    });

    if (els.successReturn) els.successReturn.focus();
  }

  function closeSuccessModal() {
    if (!successOpen || !els.successModal) return;

    successOpen = false;
    els.successModal.classList.remove('is-open');
    els.successModal.setAttribute('aria-hidden', 'true');

    window.setTimeout(() => {
      if (!successOpen) {
        els.successModal.hidden = true;
        unlockBody();
      }
    }, MODAL_MS);
  }

  function validateForm(formData) {
    const customerName = formData.get('customerName')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const address = formData.get('address')?.toString().trim() || '';
    const city = formData.get('city')?.toString().trim() || '';
    const state = formData.get('state')?.toString().trim() || '';
    const pincode = formData.get('pincode')?.toString().trim() || '';
    const shoeSize = formData.get('shoeSize')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';

    if (!customerName) return 'Please enter your name.';
    if (!phone) return 'Please enter your phone number.';
    if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      return 'Please enter a valid 10-digit phone number.';
    }
    if (!address) return 'Please enter your full address.';
    if (!city) return 'Please enter your city.';
    if (!state) return 'Please enter your state.';
    if (!pincode) return 'Please enter your PIN code.';
    if (!/^\d{6}$/.test(pincode)) return 'Please enter a valid 6-digit PIN code.';
    if (!shoeSize) return 'Please select a shoe size.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address.';
    }

    return null;
  }

  function buildOrderObject(formData) {
    const phoneDigits = formData.get('phone')?.toString().replace(/\D/g, '').slice(-10) || '';

    return {
      productId: formData.get('productId')?.toString() || '',
      productName: formData.get('productName')?.toString() || '',
      price: Number(formData.get('price')) || 0,
      shoeSize: Number(formData.get('shoeSize')) || 0,
      customerName: formData.get('customerName')?.toString().trim() || '',
      phone: phoneDigits,
      email: formData.get('email')?.toString().trim() || '',
      address: formData.get('address')?.toString().trim() || '',
      city: formData.get('city')?.toString().trim() || '',
      state: formData.get('state')?.toString().trim() || '',
      pincode: formData.get('pincode')?.toString().trim() || '',
      status: 'Pending',
    };
  }

  function setSubmitting(submitting) {
    isSubmitting = submitting;
    if (!els.submitBtn) return;
    els.submitBtn.disabled = submitting;
    els.submitBtn.textContent = submitting ? 'Submitting…' : 'Submit Order Request';
    els.submitBtn.setAttribute('aria-busy', submitting ? 'true' : 'false');
  }

  async function submitOrderToGoogleSheets(order) {
    const service = window.RBHGoogleSheets;
    if (!service?.submitOrderToGoogleSheets) {
      return {
        ok: false,
        error: 'Order service failed to load. Please refresh the page and try again.',
      };
    }
    return service.submitOrderToGoogleSheets(order);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    clearFeedback();

    const formData = new FormData(els.orderForm);
    const error = validateForm(formData);
    if (error) {
      showFeedback(error);
      return;
    }

    const order = buildOrderObject(formData);

    setSubmitting(true);

    submitOrderToGoogleSheets(order)
      .then((result) => {
        if (!result.ok) {
          showFeedback(
            'Something went wrong while submitting your request. Please try again.',
          );
          return;
        }

        resetForm();
        closeOrderModal();
        openSuccessModal();
      })
      .catch(() => {
        showFeedback(
          'Something went wrong while submitting your request. Please try again.',
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  function bindEvents() {
    if (!els.grid) return;

    els.grid.addEventListener(
      'click',
      (event) => {
        const buyBtn = event.target.closest('[data-buy-now]');
        if (!buyBtn) return;
        event.preventDefault();
        event.stopPropagation();
        const product = productFromCard(buyBtn.closest('.leather-product-card'));
        if (product?.productId) openOrderModal(product);
      },
      true,
    );

    els.orderClose.addEventListener('click', closeOrderModal);
    els.orderBackdrop.addEventListener('click', closeOrderModal);
    els.orderPanel.addEventListener('click', (event) => event.stopPropagation());
    els.orderForm.addEventListener('submit', handleSubmit);

    els.successClose.addEventListener('click', closeSuccessModal);
    els.successBackdrop.addEventListener('click', closeSuccessModal);
    els.successPanel.addEventListener('click', (event) => event.stopPropagation());
    els.successReturn.addEventListener('click', () => {
      closeSuccessModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (successOpen) {
        closeSuccessModal();
        return;
      }
      if (orderOpen) closeOrderModal();
    });
  }

  function init() {
    if (!document.querySelector('.collection-page')) return;

    mountModals();
    if (!els.orderModal) return;

    const start = () => {
      els.grid = document.getElementById('leather-catalog-grid');
      if (!els.grid) return;
      bindEvents();
    };

    if (document.getElementById('leather-catalog-grid')?.children.length) {
      start();
    } else {
      document.addEventListener('rbh:catalog-ready', start, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
