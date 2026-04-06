import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/admin/**/*.{ts,tsx}',
    './src/components/admin/**/*.{ts,tsx}',
    './src/components/admin-ui/**/*.{ts,tsx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--admin-border))',
        input: 'hsl(var(--admin-input))',
        ring: 'hsl(var(--admin-ring))',
        background: 'hsl(var(--admin-background))',
        foreground: 'hsl(var(--admin-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--admin-primary))',
          foreground: 'hsl(var(--admin-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--admin-secondary))',
          foreground: 'hsl(var(--admin-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--admin-destructive))',
          foreground: 'hsl(var(--admin-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--admin-muted))',
          foreground: 'hsl(var(--admin-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--admin-accent))',
          foreground: 'hsl(var(--admin-accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--admin-popover))',
          foreground: 'hsl(var(--admin-popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--admin-card))',
          foreground: 'hsl(var(--admin-card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--admin-radius)',
        md: 'calc(var(--admin-radius) - 2px)',
        sm: 'calc(var(--admin-radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
