import React from 'react';
import { useAtomValue } from 'jotai';
import { useI18n } from '../i18n/useI18n';
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { RequestsScreen } from '../screens/RequestsScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { isOnboardedAtom } from '../state/session';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { RootTabs } from './RootTabs';

function MainTabs() {
  const { strings: s } = useI18n();

  return (
    <RootTabs.Navigator
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <RootTabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: s.nav.home }}
      />
      <RootTabs.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: s.nav.transactions }}
      />
      <RootTabs.Screen
        name="Requests"
        component={RequestsScreen}
        options={{ title: s.nav.requests }}
      />
      <RootTabs.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: s.nav.documents }}
      />
      <RootTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: s.nav.settings }}
      />
    </RootTabs.Navigator>
  );
}

export function RootNavigator() {
  const isOnboarded = useAtomValue(isOnboardedAtom);
  return isOnboarded ? <MainTabs /> : <OnboardingScreen />;
}
