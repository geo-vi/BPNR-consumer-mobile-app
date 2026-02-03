import React, { type PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import {
  isLiquidGlassSupported,
  LiquidGlassView,
  type LiquidGlassViewProps,
} from '@callstack/liquid-glass';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<
  {
    style?: StyleProp<ViewStyle>;
    effect?: LiquidGlassViewProps['effect'];
    interactive?: LiquidGlassViewProps['interactive'];
    tintColor?: LiquidGlassViewProps['tintColor'];
    colorScheme?: LiquidGlassViewProps['colorScheme'];
  } & Omit<ViewProps, 'style'>
>;

export function GlassSurface({
  children,
  style,
  effect = 'regular',
  interactive = false,
  tintColor,
  colorScheme = 'system',
  ...viewProps
}: Props) {
  const theme = useTheme();
  const fallback = theme.colors.surface;
  const fallbackBorder = theme.colors.border;

  if (!isLiquidGlassSupported) {
    return (
      <View
        {...viewProps}
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
      {...viewProps}
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
