/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary blue family (main brand colors)
      primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#1890ff',     // ← your chosen main color
          700: '#096dd9',
          800: '#0050b3',
          900: '#003a8c',
          950: '#002766',
        },
        // Softer blue for backgrounds, cards, accents
        bluecool: {
          50:  '#f5faff',
          100: '#e6f4ff',
          200: '#c3e6ff',
          300: '#91d5ff',
          400: '#5cc2ff',
          500: '#40a9ff',
          600: '#1890ff',    // nice vibrant but not too aggressive
          700: '#096dd9',
          800: '#0050b3',
          900: '#003a8c',
        },

        // Deep / dark blues (headers, footers, dark mode)
        deepblue: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },

        // Supporting accent colors (good complements)
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        },
        indigo: {
          600: '#4f46e5',
          700: '#4338ca',
        },
           animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      },

      animation: {
      'slow-rotate': 'slowRotate 40s linear infinite',
    },
    keyframes: {
      slowRotate: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    },

      // Optional: nice gradients you can use
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-cool':   'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
        'gradient-deep':   'linear-gradient(to right, #0f172a, #1e293b)',
      },
    },
  },
  plugins: [],
}