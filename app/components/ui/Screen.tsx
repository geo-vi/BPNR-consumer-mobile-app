import React, { type PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  scroll?: boolean;
  edges?: readonly Edge[];
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  style?: ViewProps['style'];
}>;

export function Screen({
  children,
  scroll = true,
  edges,
  contentContainerStyle,
  style,
}: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}
    >
      {scroll ? (
        <ScrollView contentContainerStyle={contentContainerStyle}>
          {children}
        </ScrollView>
      ) : (
        <View style={contentContainerStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
