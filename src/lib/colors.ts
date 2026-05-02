/**
 * Centralized color system for the puzzle game application
 * All colors used throughout the app are defined here for easy theming
 */

// Core theme colors
export const APP_COLORS = {
  // Primary theme colors
  primary: {
    main: '#3d7f92',
    dark: '#2d5f72', 
    light: '#4d8fa2',
    selected: '#1e4a59'
  },

  // Default piece color
  piece: {
    default: '#3d7f92'
  },

  // Background colors
  background: {
    main: 'hsl(var(--background))',
    card: 'hsl(var(--card))',
    popover: 'hsl(var(--popover))',
    muted: 'hsl(var(--muted))',
    accent: 'hsl(var(--accent))',
    secondary: 'hsl(var(--secondary))',
    // Light mode specific
    light: {
      header: '#f3f4f6',
      panel: '#ffffff',
      grid: '#ffffff',
      section: '#f9fafb'
    },
    // Dark mode specific  
    dark: {
      header: '#1f2937',
      panel: '#1f2937',
      grid: '#374151',
      section: '#111827'
    }
  },

  // Text colors
  text: {
    foreground: 'hsl(var(--foreground))',
    muted: 'hsl(var(--muted-foreground))',
    primary: 'hsl(var(--primary-foreground))',
    secondary: 'hsl(var(--secondary-foreground))',
    accent: 'hsl(var(--accent-foreground))',
    destructive: 'hsl(var(--destructive-foreground))',
    // Semantic colors
    success: '#16a34a',
    warning: '#ea580c', 
    error: '#dc2626',
    info: '#2563eb'
  },

  // Border colors
  border: {
    main: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    // Grid border colors for light/dark themes
    light: '#000000',
    dark: '#ffffff',
    // Semantic borders
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#ef4444',
    muted: '#d1d5db'
  },

  // Cell colors
  cell: {
    preview: 'rgba(61, 127, 146, 0.35)',
    highlight: '#e07a5f',
    text: {
      light: '#000000',
      dark: '#ffffff'
    }
  },

  // App-specific colors (for App.css)
  app: {
    teal: {
      primary: '#14b8a6', // teal-500
      shadow: 'rgba(20, 184, 166, 0.6)',
      border: 'rgba(20, 184, 166, 0.1)',
      background: 'rgba(20, 184, 166, 0.02)',
      hoverBorder: 'rgba(20, 184, 166, 0.3)',
      hoverShadow: 'rgba(20, 184, 166, 0.1)'
    },
    docs: '#5f7676'
  },

  // Celebration animation colors
  celebration: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ],

  // Button colors
  button: {
    primary: {
      bg: 'hsl(var(--primary))',
      text: 'hsl(var(--primary-foreground))',
      hover: 'hsl(var(--primary))/90'
    },
    secondary: {
      bg: 'hsl(var(--secondary))',
      text: 'hsl(var(--secondary-foreground))',
      hover: 'hsl(var(--secondary))/80'
    },
    destructive: {
      bg: 'hsl(var(--destructive))',
      text: 'hsl(var(--destructive-foreground))',
      hover: 'hsl(var(--destructive))/90'
    },
    outline: {
      bg: 'hsl(var(--background))',
      text: 'hsl(var(--accent-foreground))',
      hover: 'hsl(var(--accent))',
      border: 'hsl(var(--input))'
    },
    ghost: {
      hover: 'hsl(var(--accent))',
      text: 'hsl(var(--accent-foreground))'
    }
  }
} as const;

// Legacy colors for backward compatibility
export const PUZZLE_COLORS = {
  primary: APP_COLORS.primary.main,
  primaryDark: APP_COLORS.primary.dark,
  primaryLight: APP_COLORS.primary.light,
  selectedDark: APP_COLORS.primary.selected,
  
  blue: { 500: '#3b82f6', 600: '#2563eb', 400: '#60a5fa' },
  green: { 600: '#16a34a' },
  orange: { 600: '#ea580c' },
  purple: { 600: '#9333ea', 400: '#a855f7' },
  indigo: { 600: '#4f46e5' },
  emerald: { 600: '#059669' },
  gray: { 700: '#374151', 800: '#1f2937' }
} as const;

// Puzzle piece colors
export const PIECE_COLORS = [
  { name: 'Teal', value: '#5d9caa', dark: '#4a7c87' },
  { name: 'Coral', value: '#e07a5f', dark: '#c56647' },
  { name: 'Sage', value: '#84a98c', dark: '#6b8e73' },
  { name: 'Muted Blue', value: '#7c9db8', dark: '#5a7a95' },
  { name: 'Muted Yellow', value: '#d4b85a', dark: '#b89d47' },
  { name: 'Lavender', value: '#a8a5d1', dark: '#8b87b8' },
  { name: 'Mauve', value: '#b5838d', dark: '#9a6b75' },
  { name: 'Olive', value: '#a3a380', dark: '#8a8a6b' },
  { name: 'Crimson', value: '#c85a54', dark: '#a64540' },
  { name: 'Forest', value: '#5a8a5a', dark: '#477047' },
  { name: 'Plum', value: '#8e6a8e', dark: '#735573' },
  { name: 'Amber', value: '#d49c3d', dark: '#b8832a' }
] as const;

export type PuzzleColor = typeof PUZZLE_COLORS[keyof typeof PUZZLE_COLORS];
