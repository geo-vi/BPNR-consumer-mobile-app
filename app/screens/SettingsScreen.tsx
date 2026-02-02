import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../components/ui/Screen';

export function SettingsScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});

