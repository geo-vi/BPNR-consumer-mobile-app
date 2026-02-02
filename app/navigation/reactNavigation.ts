import type { RootTabsNavigator } from './RootTabs';

declare module '@react-navigation/core' {
  interface RootNavigator extends RootTabsNavigator {}
}

export {};

