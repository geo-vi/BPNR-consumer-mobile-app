import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';
import { linking } from './navigation/linking';
import { navigationThemes } from './theme/navigationTheme';

const isTestEnv = (globalThis as any).__RN_JEST__ === true;

if (!isTestEnv) {
  enableScreens();
}

export function AppRoot() {
  const colorScheme = useColorScheme();
  const navigationTheme =
    colorScheme === 'dark' ? navigationThemes.dark : navigationThemes.light;

  return (
    <AppProviders>
      <NavigationContainer linking={linking} theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}
