const shared = {
  accent: '#6366F1',
  accentDim: '#4F46E5',
  accentSoft: 'rgba(99,102,241,0.12)',
  accentGlow: 'rgba(99,102,241,0.25)',
  green: '#22C55E',
  greenSoft: 'rgba(34,197,94,0.12)',
  orange: '#F59E0B',
  orangeSoft: 'rgba(245,158,11,0.12)',
  red: '#EF4444',
  redSoft: 'rgba(239,68,68,0.12)',
  blue: '#3B82F6',
  blueSoft: 'rgba(59,130,246,0.12)',
  purple: '#A855F7',
  purpleSoft: 'rgba(168,85,247,0.12)',
  teal: '#14B8A6',
  tealSoft: 'rgba(20,184,166,0.12)',
  spotColors: {
    cafe: '#F59E0B',
    library: '#6366F1',
    campus: '#22C55E',
    coworking: '#3B82F6',
    other: '#A855F7',
  },
} as const;

export const DarkColors = {
  ...shared,
  bg: '#09090B',
  surface: '#111116',
  surfaceElevated: '#18181F',
  border: '#27272F',
  borderSubtle: '#1D1D25',
  text: '#F4F4FF',
  textSecondary: '#8B8BA8',
  textMuted: '#55556A',
} as const;

export const LightColors = {
  ...shared,
  bg: '#F8F8FF',
  surface: '#FFFFFF',
  surfaceElevated: '#EDEDF5',
  border: '#DDDDED',
  borderSubtle: '#EAEAF2',
  text: '#09090B',
  textSecondary: '#555570',
  textMuted: '#9090AA',
} as const;

export type ColorPalette = typeof DarkColors;
