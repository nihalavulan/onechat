const { colors } = require('./src/design-system/colors');
const { typography } = require('./src/design-system/typography');
const { spacing } = require('./src/design-system/spacing');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          ...colors.primary,
          DEFAULT: colors.primary.DEFAULT,
        },
        secondary: {
          ...colors.secondary,
          DEFAULT: colors.secondary.DEFAULT,
        },
        background: {
          ...colors.background,
          DEFAULT: colors.background.DEFAULT,
        },
        surface: {
          ...colors.surface,
          DEFAULT: colors.surface.DEFAULT,
        },
        text: colors.text,
        error: {
          ...colors.error,
          DEFAULT: colors.error.DEFAULT,
        },
        success: {
          ...colors.success,
          DEFAULT: colors.success.DEFAULT,
        },
        border: {
          ...colors.border,
          DEFAULT: colors.border.DEFAULT,
        },
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      spacing: spacing.scale,
      borderRadius: {
        sm: '0.375rem', // 6px
        DEFAULT: '0.5rem', // 8px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        full: '9999px',
      },
    },
  },
  plugins: [],
}

