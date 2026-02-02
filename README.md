# BPNR Consumer Mobile App

React Native app for BPNR business owners.

## Status

This repo is currently an early scaffold (navigation, theme, app providers, and a small persisted Jotai example). Product requirements and direction live in `AGENTS.md`.

## Requirements

- Node.js `>= 20` (see `package.json`)
- Yarn (recommended) or npm
- iOS: Xcode + Ruby/Bundler + CocoaPods
- Android: Android Studio + SDK

If you don’t have Yarn installed, Node ships with Corepack:

```sh
corepack enable
```

## Setup

Install JS dependencies:

```sh
yarn install
# or: npm install
```

## Run

Start Metro:

```sh
yarn start
```

### iOS

Install pods (first clone and whenever native deps change):

```sh
bundle install
bundle exec pod install --project-directory=ios
```

Run:

```sh
yarn ios
```

### Android

Run:

```sh
yarn android
```

## Tests & lint

```sh
yarn test
yarn lint
```

## Project structure

- `app/`: product code (prefer changes here)
  - `app/AppRoot.tsx`: app root + navigation container
  - `app/providers/`: global providers (Jotai, gesture handler, safe area)
  - `app/navigation/`: routes, typing, and deep linking config
  - `app/screens/`: screen components
  - `app/services/`: networking and logging primitives
  - `app/state/`: Jotai store and atoms
  - `app/theme/`: design tokens and navigation theme

## Conventions (high-level)

- **UI:** prefer `@callstack/liquid-glass` when supported; always provide a fallback when `isLiquidGlassSupported` is false.
- **Navigation:** keep route typing in `app/navigation/types.ts` and deep links in sync in `app/navigation/linking.ts`.
- **State:** use Jotai; only persist non-sensitive values in AsyncStorage; never store secrets in AsyncStorage.
- **Services:** keep HTTP/auth concerns out of screens; put clients in `app/services/`.

## Deep links

Deep linking is configured in JS in `app/navigation/linking.ts` with a `bpnr://` prefix. Native URL scheme / intent filters still need to be wired up for devices.

## Learn more

- React Native environment setup: https://reactnative.dev/docs/environment-setup
