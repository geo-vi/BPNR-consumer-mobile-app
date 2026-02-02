import React from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

type IconProps = { color?: string; size?: number };

type Props = Omit<PressableProps, 'children'> & {
  icon: React.ComponentType<IconProps>;
  color: string;
  size?: number;
  hitSlop?: number;
};

export function IconButton({
  icon: Icon,
  color,
  size = 20,
  style,
  hitSlop = 10,
  ...props
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    >
      <Icon color={color} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.75,
  },
});

