import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppTopBar } from './AppTopBar';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren;

export function AppScaffold({ children }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <AppTopBar />
      <View style={styles.body}>{children}</View>
    </View>
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
