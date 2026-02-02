import type { ThemeMode } from '../state/settings';
import { colors, darkColors } from './colors';

export type ThemeScheme = 'light' | 'dark';

export type ThemeTones = {
  neutral: { bg: string; fg: string };
  success: { bg: string; fg: string };
  warning: { bg: string; fg: string };
  danger: { bg: string; fg: string };
};

export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  hairline: string;
  separator: string;
  backdrop: string;
  sheet: string;

  text: string;
  textMuted: string;
  placeholder: string;

  accent: string;
  onAccent: string;

  inverseSurface: string;
  inverseText: string;

  positive: string;
  negative: string;

  notification: string;
};

export type AppTheme = {
  mode: ThemeMode;
  scheme: ThemeScheme;
  isDark: boolean;
  colors: ThemeColors;
  tones: ThemeTones;
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
};

const lightTheme: Omit<AppTheme, 'mode' | 'scheme' | 'isDark'> = {
  colors: {
    background: colors.background,
    surface: colors.card,
    border: colors.border,
    hairline: 'rgba(0,0,0,0.12)',
    separator: 'rgba(0,0,0,0.08)',
    backdrop: 'rgba(0,0,0,0.35)',
    sheet: 'rgba(255,255,255,0.98)',

    text: colors.text,
    textMuted: '#374151',
    placeholder: '#9ca3af',

    accent: colors.brand,
    onAccent: '#ffffff',

    inverseSurface: '#111827',
    inverseText: '#ffffff',

    positive: '#166534',
    negative: '#991b1b',

    notification: colors.notification,
  },
  tones: {
    neutral: { bg: 'rgba(17,24,39,0.08)', fg: '#111827' },
    success: { bg: 'rgba(34,197,94,0.12)', fg: '#166534' },
    warning: { bg: 'rgba(245,158,11,0.14)', fg: '#92400e' },
    danger: { bg: 'rgba(239,68,68,0.12)', fg: '#991b1b' },
  },
  radius: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 22,
    pill: 999,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

const darkTheme: Omit<AppTheme, 'mode' | 'scheme' | 'isDark'> = {
  colors: {
    background: darkColors.background,
    surface: darkColors.card,
    border: darkColors.border,
    hairline: 'rgba(255,255,255,0.14)',
    separator: 'rgba(255,255,255,0.10)',
    backdrop: 'rgba(0,0,0,0.35)',
    sheet: 'rgba(17,24,39,0.98)',

    text: darkColors.text,
    textMuted: '#cbd5e1',
    placeholder: '#94a3b8',

    accent: darkColors.brand,
    onAccent: darkColors.background,

    inverseSurface: '#f9fafb',
    inverseText: darkColors.background,

    positive: '#86efac',
    negative: '#fecaca',

    notification: darkColors.notification,
  },
  tones: {
    neutral: { bg: 'rgba(255,255,255,0.12)', fg: '#f9fafb' },
    success: { bg: 'rgba(34,197,94,0.22)', fg: '#bbf7d0' },
    warning: { bg: 'rgba(245,158,11,0.22)', fg: '#fde68a' },
    danger: { bg: 'rgba(239,68,68,0.22)', fg: '#fecaca' },
  },
  radius: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 22,
    pill: 999,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export function createTheme(scheme: ThemeScheme, mode: ThemeMode): AppTheme {
  const base = scheme === 'dark' ? darkTheme : lightTheme;
  return {
    ...base,
    mode,
    scheme,
    isDark: scheme === 'dark',
  };
}

