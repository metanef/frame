/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink:    '#1a1a2e',
        parchment: '#e8e4d9',
        success: { DEFAULT: '#3B6D11', light: '#EAF3DE', mid: '#97C459' },
        danger:  { DEFAULT: '#E24B4A', light: '#FCEBEB', mid: '#F09595' },
        warn:    { DEFAULT: '#E67E22', light: '#FFF3E0' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { DEFAULT: '8px', lg: '12px', xl: '16px' },
    },
  },
  plugins: [],
}
