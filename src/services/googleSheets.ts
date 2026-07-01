import { GOOGLE_SCRIPT_URL } from '@/config/googleSheets';

export type OrderPayload = {
  productId: string;
  productName: string;
  price: number;
  shoeSize: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'Pending';
};

export type GoogleSheetsSubmitResult = {
  ok: boolean;
  error?: string;
};

function parseResponseBody(raw: string): { success?: boolean; error?: string } | null {
  if (!raw.trim()) return null;

  try {
    return JSON.parse(raw) as { success?: boolean; error?: string };
  } catch {
    return null;
  }
}

/**
 * POST order data to the Google Apps Script Web App (stores row in Google Sheets).
 * Uses text/plain to avoid CORS preflight issues with Apps Script deployments.
 */
export async function submitOrderToGoogleSheets(
  order: OrderPayload,
): Promise<GoogleSheetsSubmitResult> {
  const endpoint = GOOGLE_SCRIPT_URL.trim();

  if (!endpoint) {
    return {
      ok: false,
      error: 'Order service is not configured. Please contact the store directly.',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(order),
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);

    if (!response.ok) {
      return {
        ok: false,
        error: parsed?.error ?? 'Unable to submit your order. Please try again.',
      };
    }

    if (parsed && parsed.success === false) {
      return {
        ok: false,
        error: parsed.error ?? 'Unable to submit your order. Please try again.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}
