import React, { useMemo } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import { ClipboardList, Copy, FileText, Receipt, Share2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Clipboard } from 'react-native';
import { AppScaffold } from '../components/ui/AppScaffold';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { ListRow } from '../components/ui/ListRow';
import type { RequestTemplateType } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

export function HomeScreen() {
  const theme = useTheme();
  const fg = theme.colors.text;
  const mutedFg = theme.colors.textMuted;

  const navigation = useNavigation();

  const mailboxAddress = 'invoices@acme.example';
  const lastUpdated = useMemo(() => new Date().toLocaleString(), []);

  const quickActions: Array<{ label: string; type: RequestTemplateType; icon: any }> =
    [
      { label: 'Balance sheet', type: 'Balance sheet', icon: FileText },
      { label: 'Bank declaration', type: 'Bank declarations', icon: Receipt },
      { label: 'Credit loan P&L', type: 'Profit/expense (credit loan)', icon: ClipboardList },
    ];

  return (
    <AppScaffold>
      <Screen
        edges={['left', 'right', 'bottom']}
        contentContainerStyle={styles.container}
        style={styles.transparentScreen}
      >
        <ScreenHeader title="Dashboard" subtitle={`Last updated: ${lastUpdated}`} />

        <SectionCard title="Balance snapshot">
          <View style={styles.metricsRow}>
            <Metric label="Income (MTD)" value="€12,480" />
            <Metric label="Expenses (MTD)" value="€7,930" />
          </View>
          <View style={styles.metricsRow}>
            <Metric label="Net (MTD)" value="€4,550" />
            <Metric label="Cash" value="€28,120" />
          </View>
        </SectionCard>

        <SectionCard title="Income prediction">
          <Text style={[styles.bigValue, { color: fg }]}>€15,900</Text>
          <Text style={[styles.muted, { color: mutedFg }]}>
            Simple extrapolation + recurring detection. Indicator only.
          </Text>
          <Text style={[styles.muted, { color: mutedFg }]}>
            Prediction last updated: {lastUpdated}
          </Text>
        </SectionCard>

        <SectionCard
          title="Invoice completeness"
          footer={
            <View style={styles.inlineActions}>
              <Button
                title="Submit missing invoices"
                onPress={() => navigation.navigate('Documents')}
              />
            </View>
          }
        >
          <Text style={[styles.muted, { color: mutedFg }]}>
            Indicator, not legal authority. Based on bank expenses vs submitted invoices.
          </Text>
          <View style={styles.mailboxRow}>
            <View style={styles.mailboxLeft}>
              <Text style={[styles.mailboxLabel, { color: mutedFg }]}>Mailbox</Text>
              <Text style={[styles.mailboxValue, { color: fg }]}>
                {mailboxAddress}
              </Text>
            </View>
            <View style={styles.mailboxActions}>
              <IconButton
                accessibilityLabel="Copy mailbox address"
                icon={Copy}
                color={fg}
                onPress={() => copyToClipboard(mailboxAddress)}
              />
              <IconButton
                accessibilityLabel="Share mailbox address"
                icon={Share2}
                color={fg}
                onPress={() => Share.share({ message: mailboxAddress })}
              />
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Quick actions (requests)">
          <View style={styles.quickActions}>
            {quickActions.map(item => (
              <QuickAction
                key={item.type}
                label={item.label}
                icon={item.icon}
                onPress={() =>
                  navigation.navigate('Requests', {
                    openNew: true,
                    template: item.type,
                  })
                }
              />
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Recent activity">
          <View style={styles.list}>
            <ListRow
              title="Invoice paid"
              subtitle="Globex · €1,240 · Today"
              right={<Text style={[styles.rowRight, { color: mutedFg }]}>View</Text>}
              onPress={() => navigation.navigate('Documents')}
            />
            <ListRow
              title="New bank transaction"
              subtitle="ACME Bank · -€89.20 · Yesterday"
              right={<Text style={[styles.rowRight, { color: mutedFg }]}>Open</Text>}
              onPress={() => navigation.navigate('Transactions')}
            />
            <ListRow
              title="Request completed"
              subtitle="Balance sheet · Jan 2026 · Done"
              right={
                <Text style={[styles.rowRight, { color: mutedFg }]}>Download</Text>
              }
              onPress={() => navigation.navigate('Requests')}
            />
          </View>
        </SectionCard>
      </Screen>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  transparentScreen: {
    backgroundColor: 'transparent',
  },
  container: {
    padding: 16,
    gap: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bigValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  muted: {
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 18,
  },
  mailboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mailboxLeft: {
    flex: 1,
    gap: 2,
  },
  mailboxLabel: {
    fontSize: 12,
    opacity: 0.85,
    fontWeight: '700',
  },
  mailboxValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  mailboxActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineActions: {
    paddingTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  list: {
    gap: 6,
  },
  rowRight: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.85,
  },
});

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={metricStyles.wrap}>
      <Text style={[metricStyles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[metricStyles.value, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    opacity: 0.85,
    fontWeight: '700',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
});

function QuickAction({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={quickActionStyles.wrap}>
      <Button title={label} onPress={onPress} />
      <View style={quickActionStyles.icon}>
        <Icon size={18} color={theme.colors.inverseText} />
      </View>
    </View>
  );
}

const quickActionStyles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 14,
    top: 13,
    opacity: 0.9,
    pointerEvents: 'none',
  },
});

function copyToClipboard(value: string) {
  try {
    Clipboard.setString(value);
    Alert.alert('Copied', 'Mailbox address copied to clipboard.');
  } catch {
    Alert.alert('Copy unavailable', 'Unable to access clipboard on this device.');
  }
}
