import React, { type PropsWithChildren, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAtomValue } from 'jotai';
import { themeModeAtom, type ThemeMode } from '../state/settings';
import { createTheme, type AppTheme, type ThemeScheme } from './theme';

const ThemeContext = React.createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const mode = useAtomValue(themeModeAtom);
  const system = useColorScheme();

  const scheme: ThemeScheme = resolveScheme(mode, system);
  const theme = useMemo(() => createTheme(scheme, mode), [mode, scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = React.useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
}

function resolveScheme(mode: ThemeMode, system: string | null): ThemeScheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return system === 'dark' ? 'dark' : 'light';
}

