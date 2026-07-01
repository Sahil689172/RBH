import { submitOrderToGoogleSheets } from '@/services/googleSheets';

declare global {
  interface Window {
    RBHGoogleSheets?: {
      submitOrderToGoogleSheets: typeof submitOrderToGoogleSheets;
    };
  }
}

window.RBHGoogleSheets = {
  submitOrderToGoogleSheets,
};

export { submitOrderToGoogleSheets };
