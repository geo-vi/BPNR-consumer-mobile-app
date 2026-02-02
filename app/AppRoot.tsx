import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';
import { linking } from './navigation/linking';
import { navigationThemes } from './theme/navigationTheme';

const isTestEnv = (globalThis as any).__RN_JEST__ === true;

if (!isTestEnv) {
  enableScreens();
}

function AppFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator />
      <Text style={styles.fallbackText}>Loading...</Text>
    </View>
  );
}

export function AppRoot() {
  const colorScheme = useColorScheme();
  const navigationTheme =
    colorScheme === 'dark' ? navigationThemes.dark : navigationThemes.light;

  return (
    <AppProviders>
      <NavigationContainer linking={linking} theme={navigationTheme}>
        <Suspense fallback={<AppFallback />}>
          <RootNavigator />
        </Suspense>
      </NavigationContainer>
    </AppProviders>
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
