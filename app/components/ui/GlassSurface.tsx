import React, { type PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  isLiquidGlassSupported,
  LiquidGlassView,
  type LiquidGlassViewProps,
} from '@callstack/liquid-glass';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  effect?: LiquidGlassViewProps['effect'];
  interactive?: LiquidGlassViewProps['interactive'];
  tintColor?: LiquidGlassViewProps['tintColor'];
  colorScheme?: LiquidGlassViewProps['colorScheme'];
}>;

export function GlassSurface({
  children,
  style,
  effect = 'regular',
  interactive = false,
  tintColor,
  colorScheme = 'system',
}: Props) {
  const theme = useTheme();
  const fallback = theme.colors.surface;
  const fallbackBorder = theme.colors.border;

  if (!isLiquidGlassSupported) {
    return (
      <View
        style={[
          styles.fallback,
          { backgroundColor: fallback, borderColor: fallbackBorder },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <LiquidGlassView
      style={style}
      effect={effect}
      interactive={interactive}
      tintColor={tintColor}
      colorScheme={colorScheme}
    >
      {children}
    </LiquidGlassView>
  );
}

const styles = StyleSheet.create({
  fallback: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
