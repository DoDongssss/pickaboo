/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#F24E1E',
          hover:   '#D84315',
          soft:    '#FFF0EB',
          mid:     '#FDDDD4',
        },
        bg: {
          DEFAULT: '#FAF8F6',
          surface: '#FFFFFF',
          surface2:'#F5F2EF',
        },
        border: {
          DEFAULT: '#EAE6E1',
          strong:  '#D9D4CE',
        },
        text: {
          1: '#1A1714',
          2: '#6B6560',
          3: '#A89F98',
        },
        status: {
          success:    '#16A34A',
          successBg:  '#F0FDF4',
          warning:    '#D97706',
          warningBg:  '#FFFBEB',
          error:      '#DC2626',
          errorBg:    '#FEF2F2',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"DM Serif Display"', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(26,23,20,0.06), 0 1px 2px rgba(26,23,20,0.04)',
        md: '0 4px 16px rgba(26,23,20,0.08), 0 2px 6px rgba(26,23,20,0.04)',
        lg: '0 12px 32px rgba(26,23,20,0.10), 0 4px 12px rgba(26,23,20,0.06)',
        accent: '0 2px 8px rgba(242,78,30,0.30)',
        'accent-hover': '0 4px 16px rgba(242,78,30,0.40)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
        'fade-in':   'fade-in 0.3s ease forwards',
        'slide-up':  'slide-up 0.35s ease forwards',
      },
      keyframes: {
        'pulse-dot': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.5', transform: 'scale(0.7)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
