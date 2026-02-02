import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppBackground } from './AppBackground';
import { AppTopBar } from './AppTopBar';

type Props = PropsWithChildren;

export function AppScaffold({ children }: Props) {
  return (
    <AppBackground>
      <View style={styles.root}>
        <AppTopBar />
        <View style={styles.body}>{children}</View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
