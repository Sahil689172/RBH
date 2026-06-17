/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './about/index.html', './contact/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        scan: {
          '0%': { top: '0px' },
          '25%': { top: 'var(--scan-travel, 2.4rem)' },
          '50%': { top: '0px' },
          '75%': { top: 'var(--scan-travel, 2.4rem)' },
          '100%': { top: '0px' },
        },
        cut: {
          '0%': { clipPath: 'inset(0 0 0 0)' },
          '25%': { clipPath: 'inset(100% 0 0 0)' },
          '50%': { clipPath: 'inset(0 0 100% 0)' },
          '75%': { clipPath: 'inset(0 0 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
      },
      animation: {
        scan: 'scan 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite',
        cut: 'cut 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite',
      },
    },
  },
  plugins: [],
};
