# Theming (Light/Dark) in BPNR

This app uses a **tokens-first theme system**. Components read **semantic tokens** from `useTheme()` instead of branching on `useColorScheme()` or importing raw color palettes.

## Goals

- Perfect light/dark support with a single source of truth
- No scattered `useColorScheme()` checks across screens/components
- A shared UI kit (`Button/Input/Card/...`) that automatically adapts to theme
- Consistent modal/backdrop/surface styling (including Liquid Glass fallback)

## Files (source of truth)

- Theme tokens: `app/theme/theme.ts`
- Theme context + scheme resolution: `app/theme/ThemeProvider.tsx`
- Themed StyleSheet helper: `app/theme/makeStyles.ts`
- React Navigation theme mapping: `app/theme/navigationTheme.ts`
- Persisted theme mode (`system|light|dark`): `app/state/settings.ts`

## How theme selection works

We persist a **theme mode**:

- `system`: follow device appearance (default)
- `light`: force light
- `dark`: force dark

`ThemeProvider` resolves the **effective scheme** and exposes a single `theme` object:

- `theme.colors.*` (semantic color tokens)
- `theme.tones.*` (semantic tone tokens for things like badges)
- `theme.radius.*`, `theme.space.*` (layout tokens)

You can change mode in-app via **Settings → Appearance → Theme**.

## How to use theme when building components

### 1) Use semantic tokens (never raw palettes)

Use:

- `const theme = useTheme()`
- `theme.colors.text`, `theme.colors.textMuted`
- `theme.colors.background`, `theme.colors.surface`
- `theme.colors.hairline`, `theme.colors.separator`
- `theme.colors.sheet`, `theme.colors.backdrop`
- `theme.colors.inverseSurface`, `theme.colors.inverseText`

Avoid:

- importing `app/theme/colors.ts` in UI/screens
- `useColorScheme()` in UI/screens (only `ThemeProvider` should do that)
- hardcoded `#hex`/`rgba(...)` values (add a token if you need a new color)

### 2) Prefer the shared UI kit

Before creating a new styled component, check `app/components/ui/*`:

- `GlassSurface` handles Liquid Glass + fallback
- `SectionCard`, `ListRow`, `ScreenHeader` already apply theme tokens
- `Button` already adapts to theme

### 3) Create themed StyleSheets with `makeStyles`

For theme-dependent styles, use `makeStyles` so styles are created once per theme:

```ts
import React from 'react';
import { Text, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';

const useStyles = makeStyles(theme => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.textMuted,
    marginTop: theme.space.xs,
  },
}));

export function ExampleCard() {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Title</Text>
      <Text style={styles.subtitle}>Muted subtitle</Text>
    </View>
  );
}
```

For mostly-static styles, it’s fine to keep `StyleSheet.create(...)` static and inject only token-based colors via inline styles.

### 4) Modals / sheets must use theme tokens

When building a modal/sheet:

- Backdrop: `theme.colors.backdrop`
- Sheet background: `theme.colors.sheet`
- Borders: `theme.colors.hairline` or `theme.colors.separator`
- Placeholder text: `theme.colors.placeholder`

### 5) Surfaces should go through `GlassSurface`

If you want a “card-like” surface, prefer:

- `GlassSurface` for glass + fallback
- `SectionCard` when you want consistent padding/title patterns

This keeps Liquid Glass support centralized and guarantees a readable fallback when `isLiquidGlassSupported` is false.

## AI agent checklist (when creating UI)

When adding a new component/screen, the agent should:

1. Use `useTheme()` for colors/spacing/radius.
2. Avoid `useColorScheme()` outside `ThemeProvider`.
3. Avoid importing `colors`/`darkColors` (only theme internals should use them).
4. Avoid raw hex/rgba values; add tokens in `app/theme/theme.ts` if needed.
5. Use `GlassSurface` / `SectionCard` for surfaces.
6. For modals/sheets, always use `theme.colors.backdrop` + `theme.colors.sheet`.
7. Ensure icons/text use the right semantic tokens (`text`, `textMuted`, `inverseText`, etc.).
8. If a new navigation color is needed, update `app/theme/navigationTheme.ts` (don’t fork logic in screens).

