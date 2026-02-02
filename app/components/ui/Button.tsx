import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ title, variant = 'primary', style, ...props }: Props) {
  const theme = useTheme();
  const palette = buttonPalette(theme, variant);

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
        pressed && styles.pressed,
        props.disabled && styles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    >
      <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});

function buttonPalette(
  theme: ReturnType<typeof useTheme>,
  variant: NonNullable<Props['variant']>,
) {
  if (variant === 'secondary') {
    return {
      bg: 'transparent',
      fg: theme.colors.text,
      border: theme.colors.hairline,
    };
  }

  if (variant === 'ghost') {
    return {
      bg: 'transparent',
      fg: theme.colors.text,
      border: 'transparent',
    };
  }

  return {
    bg: theme.colors.inverseSurface,
    fg: theme.colors.inverseText,
    border: theme.colors.inverseSurface,
  };
}
