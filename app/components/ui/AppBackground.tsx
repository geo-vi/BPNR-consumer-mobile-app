import React, { type PropsWithChildren } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export const APP_BACKGROUND_IMAGE_URI =
  'https://images.pexels.com/photos/2265879/pexels-photo-2265879.jpeg';

type Props = PropsWithChildren;

export function AppBackground({ children }: Props) {
  const theme = useTheme();
  const overlayColor = theme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.4)';

  return (
    <ImageBackground
      source={{ uri: APP_BACKGROUND_IMAGE_URI }}
      resizeMode="cover"
      style={[styles.background, { backgroundColor: theme.colors.background }]}
    >
      <View
        pointerEvents="none"
        style={[styles.backgroundOverlay, { backgroundColor: overlayColor }]}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

