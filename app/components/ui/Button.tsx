import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

type Props = PressableProps & {
  title: string;
};

export function Button({ title, style, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    >
      <Text style={styles.title}>{title}</Text>
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
    backgroundColor: '#111827',
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

