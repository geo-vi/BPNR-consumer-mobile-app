import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';

export const RootTabs = createBottomTabNavigator<RootTabParamList>();
export type RootTabsNavigator = typeof RootTabs;

