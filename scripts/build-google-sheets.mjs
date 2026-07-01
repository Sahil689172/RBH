import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'google-sheets-service.js');

function loadSheetsUrl() {
  const fromProcess = process.env.VITE_GOOGLE_SCRIPT_URL?.trim();
  if (fromProcess) return fromProcess;

  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return '';

  const match = fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('VITE_GOOGLE_SCRIPT_URL='));

  if (!match) return '';

  const value = match.slice('VITE_GOOGLE_SCRIPT_URL='.length).trim();
  return value.replace(/^['"]|['"]$/g, '');
}

const endpoint = loadSheetsUrl();

const source = `/**
 * Generated from src/services/googleSheets.ts — do not edit by hand.
 * Rebuild: node scripts/build-google-sheets.mjs
 */
(function () {
  'use strict';

  var GOOGLE_SCRIPT_URL = ${JSON.stringify(endpoint)};

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
`;

fs.writeFileSync(outFile, source, 'utf8');
console.log(`Built google-sheets-service.js${endpoint ? '' : ' (no VITE_GOOGLE_SCRIPT_URL set)'}`);
