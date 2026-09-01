/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB',    // Primary Blue #2563EB
          secondary: '#3B82F6',  // Secondary Blue #3B82F6
          card: '#EEF4FF',       // Background Card #EEF4FF
          surface: '#F8FAFC',    // Surface #F8FAFC
          success: '#22C55E',    // Success #22C55E
          text: '#111827',       // Text #111827
        },
      },
      backgroundImage: {
        'soft-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(238, 244, 255, 0.65) 100%)',
        'soft-glass-dark': 'linear-gradient(135deg, rgba(17, 24, 39, 0.92) 0%, rgba(30, 58, 138, 0.85) 100%)',
        'bento-gradient': 'radial-gradient(at 10% 10%, rgba(37, 99, 235, 0.08) 0px, transparent 60%), radial-gradient(at 90% 90%, rgba(59, 130, 246, 0.06) 0px, transparent 60%)',
      },
      boxShadow: {
        'bento': '0 4px 20px -2px rgba(37, 99, 235, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'bento-hover': '0 12px 30px -4px rgba(37, 99, 235, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
        'soft-glow': '0 0 25px rgba(37, 99, 235, 0.15)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
