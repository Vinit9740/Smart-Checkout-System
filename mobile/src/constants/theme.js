export const COLORS = {
  // Primary palette — vibrant indigo/violet accent on white
  primary: '#6366F1',        // Indigo
  primaryDark: '#4F46E5',    // Deep indigo
  primaryLight: '#A5B4FC',   // Soft indigo
  primaryGlow: 'rgba(99,102,241,0.15)',

  // Secondary accent
  accent: '#06B6D4',         // Cyan
  accentLight: '#67E8F9',

  // Light Theme (Clean & Modern)
  background: '#F8F9FC',     // Off-white
  surface: '#FFFFFF',
  surfaceLight: '#F1F3F9',   // Subtle gray fill
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',     // Soft gray border

  // Text
  textPrimary: '#1A202C',    // Near-black
  textSecondary: '#64748B',  // Slate gray
  textMuted: '#94A3B8',      // Light muted

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',

  // Doodle / decor colors
  doodle: 'rgba(99,102,241,0.07)',
  doodleStrong: 'rgba(99,102,241,0.13)',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.55)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
};

export const BORDER_RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 10,
  },
};
