import React, { type PropsWithChildren } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { appStore } from '../state/store';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <JotaiProvider store={appStore}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </GestureHandlerRootView>
    </JotaiProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
