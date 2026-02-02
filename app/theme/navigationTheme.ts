import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme,
} from '@react-navigation/native';

import type { AppTheme } from './theme';

export function getNavigationTheme(appTheme: AppTheme): Theme {
  const base = appTheme.isDark ? NavigationDarkTheme : NavigationDefaultTheme;
  return {
    ...base,
    dark: appTheme.isDark,
    colors: {
      ...base.colors,
      primary: appTheme.colors.accent,
      background: appTheme.colors.background,
      card: appTheme.colors.surface,
      border: appTheme.colors.border,
      text: appTheme.colors.text,
      notification: appTheme.colors.notification,
    },
  };
}
