import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useAtom } from 'jotai';
import { counterAtom } from '../state/atoms';
import { Screen } from '../components/ui/Screen';
import { Button } from '../components/ui/Button';

export function HomeScreen() {
  const [count, setCount] = useAtom(counterAtom);

  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.label}>Counter: {count}</Text>
      <Button
        title="Increment"
        onPress={() => setCount(async promiseOrValue => (await promiseOrValue) + 1)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
  },
});
