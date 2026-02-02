import React, { type PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { GlassSurface } from './GlassSurface';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  title?: string;
  style?: ViewStyle;
  footer?: React.ReactNode;
}>;

export function SectionCard({ title, style, footer, children }: Props) {
  const theme = useTheme();

  return (
    <GlassSurface style={[styles.card, style]} effect="regular">
      <View style={styles.inner}>
        {title ? (
          <Text style={[styles.title, { color: theme.colors.textMuted }]}>
            {title}
          </Text>
        ) : null}
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inner: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  footer: {
    paddingTop: 8,
  },
});
