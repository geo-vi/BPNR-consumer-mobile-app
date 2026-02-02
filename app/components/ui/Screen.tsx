import React, { type PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  style?: ViewProps['style'];
}>;

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  style,
}: Props) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
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

