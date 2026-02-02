import React, { Suspense, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';
import { linking } from './navigation/linking';
import { getNavigationTheme } from './theme/navigationTheme';
import { useTheme } from './theme/ThemeProvider';
import { useAtomValue } from 'jotai';
import { useMockApiAtom } from './state/settings';
import { disableApiMocks, enableApiMocks } from './services/apiMocks';

const isTestEnv = (globalThis as any).__RN_JEST__ === true;

if (!isTestEnv) {
  enableScreens();
}

function AppFallback() {
  const theme = useTheme();
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator color={theme.colors.textMuted} />
      <Text style={[styles.fallbackText, { color: theme.colors.text }]}>
        Loading...
      </Text>
    </View>
  );
}

export function AppRoot() {
  return (
    <AppProviders>
      <ApiMockingController />
      <AppNavigation />
    </AppProviders>
  );
}

function ApiMockingController() {
  const enabled = useAtomValue(useMockApiAtom);

  useEffect(() => {
    if (isTestEnv) return;
    if (!__DEV__) return;

    if (enabled) {
      enableApiMocks({ onNoMatch: 'throwException' });
    } else {
      disableApiMocks();
    }
  }, [enabled]);

  return null;
}

function AppNavigation() {
  const theme = useTheme();
  const navigationTheme = getNavigationTheme(theme);

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer linking={linking} theme={navigationTheme}>
        <Suspense fallback={<AppFallback />}>
          <RootNavigator />
        </Suspense>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fallbackText: {
    fontSize: 16,
  },
});
