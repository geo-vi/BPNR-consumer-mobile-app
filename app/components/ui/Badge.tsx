import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
};

export function Badge({ label, tone = 'neutral', style }: Props) {
  const theme = useTheme();
  const palette = theme.tones;

  return (
    <View style={[styles.base, { backgroundColor: palette[tone].bg }, style]}>
      <Text style={[styles.text, { color: palette[tone].fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
