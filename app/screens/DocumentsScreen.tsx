import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Clipboard } from 'react-native';
import { Copy, FileText, Search, Share2, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScaffold } from '../components/ui/AppScaffold';
import { Badge } from '../components/ui/Badge';
import { Chip } from '../components/ui/Chip';
import { GlassSurface } from '../components/ui/GlassSurface';
import { IconButton } from '../components/ui/IconButton';
import { ListRow } from '../components/ui/ListRow';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { Button } from '../components/ui/Button';
import { useTheme } from '../theme/ThemeProvider';

type StatusFilter = 'Pending' | 'Approved' | 'Rejected' | 'All';

type DocumentStatus = 'Submitted' | 'Missing fields' | 'Rejected';

type DocumentItem = {
  id: string;
  supplier: string;
  total: number;
  date: string;
  status: DocumentStatus;
  bucket: Exclude<StatusFilter, 'All'>;
};

const demoDocuments: DocumentItem[] = [
  {
    id: 'd-1',
    supplier: 'Office Supplies Co.',
    total: 189.2,
    date: '2026-02-02',
    status: 'Missing fields',
    bucket: 'Pending',
  },
  {
    id: 'd-2',
    supplier: 'Globex',
    total: 1240,
    date: '2026-02-01',
    status: 'Submitted',
    bucket: 'Approved',
  },
  {
    id: 'd-3',
    supplier: 'Rent',
    total: 1200,
    date: '2026-01-31',
    status: 'Rejected',
    bucket: 'Rejected',
  },
];

export function DocumentsScreen() {
  const theme = useTheme();
  const fg = theme.colors.text;
  const mutedFg = theme.colors.textMuted;
  const border = theme.colors.hairline;

  const mailboxAddress = 'invoices@acme.example';

  const [filter, setFilter] = useState<StatusFilter>('Pending');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DocumentItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoDocuments.filter(doc => {
      if (filter !== 'All' && doc.bucket !== filter) return false;
      if (!q) return true;
      return (
        doc.supplier.toLowerCase().includes(q) ||
        doc.date.includes(q) ||
        doc.status.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  return (
    <AppScaffold>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <ScreenHeader title="Invoices / Documents" />

              <SectionCard title="Submission">
                <Text style={[styles.muted, { color: mutedFg }]}>
                  Mailbox-only in v1. Upload document is future.
                </Text>
                <View style={styles.mailboxRow}>
                  <View style={styles.mailboxLeft}>
                    <Text style={[styles.mailboxLabel, { color: mutedFg }]}>
                      Mailbox address
                    </Text>
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

              <SectionCard>
                <View style={styles.chips}>
                  <Chip
                    label="Pending"
                    selected={filter === 'Pending'}
                    onPress={() => setFilter('Pending')}
                  />
                  <Chip
                    label="Approved"
                    selected={filter === 'Approved'}
                    onPress={() => setFilter('Approved')}
                  />
                  <Chip
                    label="Rejected"
                    selected={filter === 'Rejected'}
                    onPress={() => setFilter('Rejected')}
                  />
                  <Chip
                    label="All"
                    selected={filter === 'All'}
                    onPress={() => setFilter('All')}
                  />
                </View>

                <View style={[styles.searchRow, { borderColor: border }]}>
                  <Search size={16} color={theme.colors.placeholder} />
                  <TextInput
                    placeholder="Search supplier / status"
                    placeholderTextColor={theme.colors.placeholder}
                    value={query}
                    onChangeText={setQuery}
                    style={[styles.searchInput, { color: fg }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </SectionCard>
            </View>
          }
          renderItem={({ item }) => (
            <GlassSurface style={styles.rowCard} effect="regular">
              <ListRow
                title={item.supplier}
                subtitle={`${item.date} · €${item.total.toFixed(2)}`}
                badges={
                  <Badge
                    label={item.status}
                    tone={item.status === 'Rejected' ? 'danger' : item.status === 'Missing fields' ? 'warning' : 'success'}
                  />
                }
                right={<FileText color={fg} size={18} />}
                onPress={() => setSelected(item)}
              />
            </GlassSurface>
          )}
        />

        <Modal
          animationType="slide"
          visible={selected !== null}
          transparent
          onRequestClose={() => setSelected(null)}
        >
          <Pressable
            style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
            onPress={() => setSelected(null)}
          />
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.sheet },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: fg }]}>Document</Text>
              <IconButton
                accessibilityLabel="Close"
                icon={X}
                color={fg}
                onPress={() => setSelected(null)}
              />
            </View>

            {selected ? (
              <>
                <SectionCard title="Details">
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: mutedFg }]}>Supplier</Text>
                    <Text style={[styles.detailValue, { color: fg }]}>{selected.supplier}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: mutedFg }]}>Date</Text>
                    <Text style={[styles.detailValue, { color: fg }]}>{selected.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: mutedFg }]}>Total</Text>
                    <Text style={[styles.detailValue, { color: fg }]}>
                      €{selected.total.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: mutedFg }]}>Status</Text>
                    <Badge
                      label={selected.status}
                      tone={
                        selected.status === 'Rejected'
                          ? 'danger'
                          : selected.status === 'Missing fields'
                            ? 'warning'
                            : 'success'
                      }
                    />
                  </View>
                </SectionCard>

                <View style={styles.sheetActions}>
                  <Button
                    title="View PDF"
                    onPress={() => Alert.alert('Coming soon', 'PDF viewer will be added later.')}
                  />
                  <View style={styles.sheetActionsSpacer} />
                  <Button
                    title="Share"
                    onPress={() =>
                      Share.share({
                        message: `Invoice from ${selected.supplier} · €${selected.total.toFixed(2)} · ${selected.date}`,
                      })
                    }
                  />
                </View>
              </>
            ) : null}
          </View>
        </Modal>
      </SafeAreaView>
    </AppScaffold>
  );
}

function copyToClipboard(value: string) {
  try {
    Clipboard.setString(value);
    Alert.alert('Copied', 'Mailbox address copied to clipboard.');
  } catch {
    Alert.alert('Copy unavailable', 'Unable to access clipboard on this device.');
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: 16,
    gap: 10,
  },
  headerWrap: {
    gap: 10,
    paddingBottom: 6,
  },
  muted: {
    fontSize: 13,
    opacity: 0.75,
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
    opacity: 0.7,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  rowCard: {
    borderRadius: 16,
    overflow: 'hidden',
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  sheetActions: {
    paddingTop: 2,
  },
  sheetActionsSpacer: {
    height: 10,
  },
});
