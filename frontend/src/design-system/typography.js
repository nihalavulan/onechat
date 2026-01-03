/**
 * Typography scale for OneChat design system
 * Modern, clean font stack suitable for social chat applications
 */

const typography = {
  // Font families
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ],
    display: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
  },

  // Font sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Typography presets
  heading: {
    h1: {
      fontSize: '2.25rem', // 36px
      lineHeight: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.875rem', // 30px
      lineHeight: '2.25rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem', // 24px
      lineHeight: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.75rem',
      fontWeight: 600,
    },
  },

  body: {
    large: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem',
      fontWeight: 400,
    },
    medium: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem',
      fontWeight: 400,
    },
    small: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem',
      fontWeight: 400,
    },
  },
};

module.exports = { typography };

