/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          bg: '#F8F9F7',
          dark: '#17212B',
          navy: '#1F3347',
          teal: '#0F766E',
          'teal-light': '#14B8A6',
          orange: '#D97706',
          border: '#E5E7EB',
          card: '#FFFFFF',
          muted: '#6B7280',
          accent: '#0284C7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov-sm': '0 1px 2px 0 rgba(23, 33, 43, 0.05)',
        'gov-card': '0 2px 8px -2px rgba(23, 33, 43, 0.08), 0 1px 3px -1px rgba(23, 33, 43, 0.04)',
        'gov-hover': '0 8px 16px -4px rgba(23, 33, 43, 0.12), 0 4px 6px -2px rgba(23, 33, 43, 0.06)',
      }
    },
  },
  plugins: [],
}
