import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-elevated': 'var(--color-bg-elevated)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-3': 'var(--color-surface-3)',
        brand: 'var(--color-brand)',
        'brand-deep': 'var(--color-brand-deep)',
        'brand-light': 'var(--color-brand-light)',
        'brand-cyan': 'var(--color-brand-cyan)',
        accent: 'var(--color-accent)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'accent-dim': 'var(--color-accent-dim)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        'glow-cyan': 'var(--shadow-glow-cyan)',
        'glow-strong': 'var(--shadow-glow-strong)',
        card: 'var(--shadow-card)',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-brand-soft': 'var(--gradient-brand-soft)',
      },
      animation: {
        'fade-up': 'fadeUp 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
        shake: 'shake 300ms ease-in-out',
        'modal-in': 'modalIn 480ms cubic-bezier(0.34, 1.45, 0.64, 1)',
        'gradient-flow': 'gradientFlow 5s ease infinite',
        'logo-pulse': 'logoPulse 3s ease-in-out infinite',
        float: 'orbFloat 12s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(134, 59, 255, 0)' },
          '50%': { boxShadow: '0 0 24px rgba(134, 59, 255, 0.55)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        modalIn: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.92)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
} satisfies Config
