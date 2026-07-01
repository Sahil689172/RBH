/**
 * Generated from src/services/googleSheets.ts — do not edit by hand.
 * Rebuild: node scripts/build-google-sheets.mjs
 */
(function () {
  'use strict';

  var GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxohs4tw462P4842PYa7d1CKCosySjwN5NJcVFGANvDcy0Wn-1uKgTFLiYchPacMWFEkQ/exec";

  function parseResponseBody(raw) {
    if (!raw.trim()) return null;
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }

  function submitOrderToGoogleSheets(order) {
    var url = GOOGLE_SCRIPT_URL.trim();

    if (!url) {
      return Promise.resolve({
        ok: false,
        error: 'Order service is not configured. Please contact the store directly.',
      });
    }

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(order),
    })
      .then(function (response) {
        return response.text().then(function (raw) {
          var parsed = parseResponseBody(raw);

          if (!response.ok) {
            return {
              ok: false,
              error: (parsed && parsed.error) || 'Unable to submit your order. Please try again.',
            };
          }

          if (parsed && parsed.success === false) {
            return {
              ok: false,
              error: parsed.error || 'Unable to submit your order. Please try again.',
            };
          }

          return { ok: true };
        });
      })
      .catch(function () {
        return {
          ok: false,
          error: 'Network error. Please check your connection and try again.',
        };
      });
  }

  window.RBHGoogleSheets = {
    submitOrderToGoogleSheets: submitOrderToGoogleSheets,
  };
})();
