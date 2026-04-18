/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      /* ── Typography ── */
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '1rem' }],
        xs:    ['0.6875rem', { lineHeight: '1rem' }],
        sm:    ['0.8125rem', { lineHeight: '1.25rem' }],
        base:  ['0.9375rem', { lineHeight: '1.5rem' }],
        lg:    ['1.0625rem', { lineHeight: '1.625rem' }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',    { lineHeight: '2rem' }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem',      { lineHeight: '1', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem',   { lineHeight: '1', letterSpacing: '-0.04em' }],
        '7xl': ['4.5rem',    { lineHeight: '1', letterSpacing: '-0.04em' }],
        '8xl': ['6rem',      { lineHeight: '1', letterSpacing: '-0.05em' }],
      },

      /* ── Spacing: Tailwind defaults (do NOT override — use CSS vars for custom scale) ── */

      /* ── Border radius ── */
      borderRadius: {
        none:  '0',
        sm:    '6px',
        DEFAULT: '10px',
        md:    '10px',
        lg:    '14px',
        xl:    '20px',
        '2xl': '28px',
        '3xl': '36px',
        full:  '9999px',
      },

      /* ── Shadows ── */
      boxShadow: {
        xs:    '0 1px 2px rgba(0,0,0,0.25)',
        sm:    '0 2px 8px rgba(0,0,0,0.3)',
        DEFAULT: '0 4px 16px rgba(0,0,0,0.35)',
        md:    '0 4px 16px rgba(0,0,0,0.35)',
        lg:    '0 8px 32px rgba(0,0,0,0.4)',
        xl:    '0 16px 48px rgba(0,0,0,0.5)',
        '2xl': '0 24px 64px rgba(0,0,0,0.6)',
        glow:  '0 0 20px rgba(6,182,212,0.3)',
        'glow-lg': '0 0 40px rgba(6,182,212,0.25)',
        inner: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        none:  'none',
      },

      /* ── Transitions ── */
      transitionDuration: {
        fast:  '100ms',
        base:  '200ms',
        slow:  '350ms',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      /* ── Colors ── */
      colors: {
        /* Semantic */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',
        /* Surface tokens */
        surface: {
          0:  'var(--surface-0)',
          1:  'var(--surface-1)',
          2:  'var(--surface-2)',
          3:  'var(--surface-3)',
          4:  'var(--surface-4)',
          5:  'var(--surface-5)',
        },
        /* Brand */
        brand: {
          primary:          'var(--color-primary)',
          'primary-light':  'var(--color-primary-light)',
          'primary-dark':   'var(--color-primary-dark)',
          secondary:        'var(--color-secondary)',
          'secondary-light':'var(--color-secondary-light)',
        },
        /* States */
        success:  'var(--color-success)',
        warning:  'var(--color-warning)',
        error:    'var(--color-error)',
        /* Chart */
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },

      /* ── Keyframes ── */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          from: { opacity: '1' },
          to:   { opacity: '0' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' }
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.7' },
          '50%':      { opacity: '1' }
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' }
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in':         'fade-in 0.25s ease-out',
        'fade-out':        'fade-out 0.2s ease-out',
        'scale-in':        'scale-in 0.2s ease-out',
        'slide-in-up':     'slide-in-up 0.3s ease-out',
        'pulse-subtle':    'pulse-subtle 2.5s ease-in-out infinite',
        'shimmer':         'shimmer 2.5s linear infinite',
      },

      /* ── Backdrop blur presets ── */
      backdropBlur: {
        xs:  '4px',
        sm:  '8px',
        DEFAULT: '12px',
        md:  '16px',
        lg:  '24px',
        xl:  '32px',
      },
    },
  },
  safelist: [
    /* Dynamic color classes used from entity data */
    { pattern: /bg-(cyan|teal|violet|fuchsia|pink|purple|red|orange|yellow|green|blue|indigo)-(4|5|6|7|8|9)00/ },
    { pattern: /text-(cyan|teal|violet|fuchsia|pink|purple|red|orange|yellow|green|blue|indigo)-(3|4|5)00/ },
    { pattern: /border-(cyan|teal|violet|fuchsia|pink|purple)-(4|5|6)00/ },
    { pattern: /from-(cyan|teal|violet|fuchsia|purple)-(4|5|6)00/ },
    { pattern: /to-(cyan|teal|violet|fuchsia|purple)-(4|5|6)00/ },
    { pattern: /shadow-(cyan|violet|fuchsia|purple)-(4|5|6|7)00/ },
  ],
  plugins: [require("tailwindcss-animate")],
}