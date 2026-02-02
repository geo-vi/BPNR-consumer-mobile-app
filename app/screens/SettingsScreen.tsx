import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronRight, X } from 'lucide-react-native';
import { useAtom, useAtomValue } from 'jotai';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScaffold } from '../components/ui/AppScaffold';
import { IconButton } from '../components/ui/IconButton';
import { ListRow } from '../components/ui/ListRow';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { SectionCard } from '../components/ui/SectionCard';
import {
  companiesAtom,
  notificationPrefsAtom,
  selectedCompanyIdAtom,
  serverUrlAtom,
} from '../state/session';
import { themeModeAtom, useMockApiAtom } from '../state/settings';
import { useTheme } from '../theme/ThemeProvider';

export function SettingsScreen() {
  const theme = useTheme();
  const fg = theme.colors.text;
  const mutedFg = theme.colors.textMuted;
  const border = theme.colors.hairline;
  const saveBg = theme.colors.inverseSurface;
  const saveText = theme.colors.inverseText;

  const companies = useAtomValue(companiesAtom);
  const [selectedCompanyId, setSelectedCompanyId] = useAtom(selectedCompanyIdAtom);
  const selectedCompany = useMemo(
    () => companies.find(c => c.id === selectedCompanyId) ?? companies[0],
    [companies, selectedCompanyId],
  );

  const [serverUrl, setServerUrl] = useAtom(serverUrlAtom);
  const [serverOpen, setServerOpen] = useState(false);
  const [serverDraft, setServerDraft] = useState(serverUrl);

  const [prefs, setPrefs] = useAtom(notificationPrefsAtom);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const [themeMode, setThemeMode] = useAtom(themeModeAtom);
  const [themeOpen, setThemeOpen] = useState(false);

  const [useMockApi, setUseMockApi] = useAtom(useMockApiAtom);

  const themeLabel =
    themeMode === 'system'
      ? 'System'
      : themeMode === 'light'
        ? 'Light'
        : 'Dark';

  return (
    <AppScaffold>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
        <View style={styles.container}>
          <ScreenHeader title="Settings" />

          <SectionCard title="Account">
            <ListRow
              title="Company"
              subtitle={selectedCompany?.name ?? 'Not selected'}
              right={<ChevronRight size={18} color={mutedFg} />}
              onPress={() => {
                if (!companies.length) return;
                const idx = companies.findIndex(c => c.id === selectedCompanyId);
                const next = companies[(idx + 1) % companies.length];
                if (next) setSelectedCompanyId(next.id);
              }}
            />
            <ListRow
              title="Server"
              subtitle={serverUrl ? serverUrl : 'Not set'}
              right={<ChevronRight size={18} color={mutedFg} />}
              onPress={() => {
                setServerDraft(serverUrl);
                setServerOpen(true);
              }}
            />
          </SectionCard>

          <SectionCard title="Notifications">
            <ListRow
              title="Preferences"
              subtitle="Enable/disable by type"
              right={<ChevronRight size={18} color={mutedFg} />}
              onPress={() => setPrefsOpen(true)}
            />
          </SectionCard>

          <SectionCard title="Appearance">
            <ListRow
              title="Theme"
              subtitle={themeLabel}
              right={<ChevronRight size={18} color={mutedFg} />}
              onPress={() => setThemeOpen(true)}
            />
          </SectionCard>

          {__DEV__ ? (
            <SectionCard title="Developer">
              <ListRow
                title="Use mock backend"
                subtitle="Intercept API calls with fixtures (no real network)"
                right={<Switch value={useMockApi} onValueChange={setUseMockApi} />}
              />
            </SectionCard>
          ) : null}

          <SectionCard title="Security">
            <ListRow
              title="Logout"
              subtitle="Re-login required if refresh fails"
              right={<ChevronRight size={18} color={mutedFg} />}
              onPress={() =>
                Alert.alert('Logout', 'This is a placeholder for v1 auth.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive' },
                ])
              }
            />
            <ListRow
              title="Device"
              subtitle="Session + device management (future)"
              right={<ChevronRight size={18} color={mutedFg} />}
              onPress={() =>
                Alert.alert('Device', 'Device management will be added later.')
              }
            />
          </SectionCard>

          <SectionCard title="Help">
            <ListRow
              title="Contact accountant"
              subtitle="Mailbox + messaging (future)"
              right={<ChevronRight size={18} color={mutedFg} />}
              onPress={() =>
                Alert.alert(
                  'Contact accountant',
                  'Contact flows will be wired to the backend.',
                )
              }
            />
          </SectionCard>
        </View>

        <Modal
          animationType="slide"
          visible={serverOpen}
          transparent
          onRequestClose={() => setServerOpen(false)}
        >
          <Pressable
            style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
            onPress={() => setServerOpen(false)}
          />
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.sheet },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: fg }]}>Server</Text>
              <IconButton
                accessibilityLabel="Close"
                icon={X}
                color={fg}
                onPress={() => setServerOpen(false)}
              />
            </View>
            <Text style={[styles.sheetHint, { color: mutedFg }]}>
              Entry flow is server URL first. Discovery via `erp.json` will be added.
            </Text>
            <TextInput
              placeholder="https://example.com"
              placeholderTextColor={theme.colors.placeholder}
              value={serverDraft}
              onChangeText={setServerDraft}
              style={[styles.input, { color: fg, borderColor: border }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.sheetActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setServerUrl(serverDraft.trim());
                  setServerOpen(false);
                }}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: saveBg },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.saveButtonText, { color: saveText }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          visible={prefsOpen}
          transparent
          onRequestClose={() => setPrefsOpen(false)}
        >
          <Pressable
            style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
            onPress={() => setPrefsOpen(false)}
          />
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.sheet },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: fg }]}>Notifications</Text>
              <IconButton
                accessibilityLabel="Close"
                icon={X}
                color={fg}
                onPress={() => setPrefsOpen(false)}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: fg }]}>Bank transactions</Text>
              <Switch
                value={prefs.bankTransactions}
                onValueChange={value => setPrefs({ ...prefs, bankTransactions: value })}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: fg }]}>Invoices</Text>
              <Switch
                value={prefs.invoices}
                onValueChange={value => setPrefs({ ...prefs, invoices: value })}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: fg }]}>Missing documents</Text>
              <Switch
                value={prefs.missingDocuments}
                onValueChange={value => setPrefs({ ...prefs, missingDocuments: value })}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: fg }]}>Accountant messages</Text>
              <Switch
                value={prefs.accountantMessages}
                onValueChange={value => setPrefs({ ...prefs, accountantMessages: value })}
              />
            </View>
            <Text style={[styles.sheetHint, { color: mutedFg }]}>
              Delivery and inbox will be wired to APNs/FCM + the notification service.
            </Text>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          visible={themeOpen}
          transparent
          onRequestClose={() => setThemeOpen(false)}
        >
          <Pressable
            style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
            onPress={() => setThemeOpen(false)}
          />
          <View style={[styles.sheet, { backgroundColor: theme.colors.sheet }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: fg }]}>Theme</Text>
              <IconButton
                accessibilityLabel="Close"
                icon={X}
                color={fg}
                onPress={() => setThemeOpen(false)}
              />
            </View>
            <Text style={[styles.sheetHint, { color: mutedFg }]}>
              System follows device appearance.
            </Text>
            <View style={styles.optionList}>
              {(['system', 'light', 'dark'] as const).map((value, idx, arr) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  onPress={() => {
                    setThemeMode(value);
                    setThemeOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    idx !== arr.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.colors.separator,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.optionText, { color: fg }]}>
                    {value === 'system'
                      ? 'System'
                      : value === 'light'
                        ? 'Light'
                        : 'Dark'}
                  </Text>
                  {themeMode === value ? (
                    <Text style={[styles.optionSelected, { color: mutedFg }]}>
                      Selected
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: 16,
    gap: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    gap: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  sheetHint: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  sheetActions: {
    paddingTop: 2,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionList: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  optionSelected: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
});
