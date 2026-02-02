import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme,
} from '@react-navigation/native';
import { colors, darkColors } from './colors';

export const navigationThemes: Record<'light' | 'dark', Theme> = {
  light: {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      primary: colors.brand,
      background: colors.background,
      card: colors.card,
      border: colors.border,
      text: colors.text,
      notification: colors.notification,
    },
  },
  dark: {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      primary: darkColors.brand,
      background: darkColors.background,
      card: darkColors.card,
      border: darkColors.border,
      text: darkColors.text,
      notification: darkColors.notification,
    },
  },
};

