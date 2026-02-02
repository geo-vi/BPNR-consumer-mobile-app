import React from 'react';
import {
  ArrowLeftRight,
  ClipboardList,
  FileText,
  House,
  Settings,
} from 'lucide-react-native';
import { useAtomValue } from 'jotai';
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { RequestsScreen } from '../screens/RequestsScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { isOnboardedAtom } from '../state/session';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { RootTabs } from './RootTabs';

function MainTabs() {
  return (
    <RootTabs.Navigator
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <RootTabs.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <RootTabs.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Txns' }}
      />
      <RootTabs.Screen
        name="Requests"
        component={RequestsScreen}
        options={{ title: 'Requests' }}
      />
      <RootTabs.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: 'Invoices' }}
      />
      <RootTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </RootTabs.Navigator>
  );
}

export function RootNavigator() {
  const isOnboarded = useAtomValue(isOnboardedAtom);
  return isOnboarded ? <MainTabs /> : <OnboardingScreen />;
}
