/**
 * Color tokens for OneChat design system
 * Based on modern social media/chat application aesthetics
 */

const colors = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    DEFAULT: '#000000', // Black for primary actions (from reference)
  },

  // Secondary colors
  secondary: {
    DEFAULT: '#ec4899', // Pink for likes/hearts (from reference)
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9f1239',
    900: '#831843',
  },

  // Background colors
  background: {
    DEFAULT: '#f5f5f5', // Light grey background (from reference)
    light: '#ffffff',
    dark: '#e5e5e5',
  },

  // Surface colors
  surface: {
    DEFAULT: '#ffffff',
    elevated: '#ffffff',
    hover: '#f9fafb',
  },

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#4b5563',
    muted: '#9ca3af',
    inverse: '#ffffff',
  },

  // Error colors
  error: {
    DEFAULT: '#ef4444',
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Success colors
  success: {
    DEFAULT: '#10b981',
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Border colors
  border: {
    DEFAULT: '#e5e7eb',
    light: '#f3f4f6',
    dark: '#d1d5db',
  },
};

module.exports = { colors };

