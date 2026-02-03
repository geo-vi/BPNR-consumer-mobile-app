import React, { type PropsWithChildren } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
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
  const tabBarHeight = React.useContext(BottomTabBarHeightContext) ?? 0;
  const flattenedContentStyle = StyleSheet.flatten(contentContainerStyle) ?? {};
  const basePaddingBottom =
    typeof flattenedContentStyle.paddingBottom === 'number'
      ? flattenedContentStyle.paddingBottom
      : 0;
  const paddedContentStyle = [
    contentContainerStyle,
    { paddingBottom: basePaddingBottom + tabBarHeight + 24 },
  ];

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}
    >
      {scroll ? (
        <ScrollView contentContainerStyle={paddedContentStyle}>
          {children}
        </ScrollView>
      ) : (
        <View style={paddedContentStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
