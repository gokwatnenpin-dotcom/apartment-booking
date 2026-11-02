/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1F2A30', soft: '#2E3B42' },
        sand: { DEFAULT: '#F5F2EB', deep: '#E3DED3' },
        accent: { DEFAULT: '#B94A30', dark: '#9A3D27' },
        slate: '#66727A',
        success: { DEFAULT: '#3E7B5A', tint: '#DCEBE2' },
        warning: { DEFAULT: '#A8691A', tint: '#F3E5CC' },
        danger: { DEFAULT: '#A63A2B', tint: '#F1D9D4' },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: { control: '8px', card: '12px' },
      boxShadow: { overlay: '0 8px 24px rgba(31,42,48,0.12)' },
    },
  },
  plugins: [],
};
