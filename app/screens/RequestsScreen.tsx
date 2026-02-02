import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Calendar, Plus, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppScaffold } from '../components/ui/AppScaffold';
import { Badge } from '../components/ui/Badge';
import { Chip } from '../components/ui/Chip';
import { GlassSurface } from '../components/ui/GlassSurface';
import { IconButton } from '../components/ui/IconButton';
import { ListRow } from '../components/ui/ListRow';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { SectionCard } from '../components/ui/SectionCard';
import type { RequestTemplateType } from '../navigation/types';
import { Button } from '../components/ui/Button';
import { useTheme } from '../theme/ThemeProvider';

type RequestStatus = 'Open' | 'Done';

type Request = {
  id: string;
  type: RequestTemplateType;
  period: string;
  status: RequestStatus;
};

type Filter = 'Open' | 'Done' | 'All';

const periodOptions = ['This month', 'Last 30 days', 'Last 12 months', 'Custom range'];

const templateOptions: Array<{ type: RequestTemplateType; description: string }> = [
  { type: 'Balance sheet', description: 'Standard balance sheet request' },
  { type: 'Bank declarations', description: 'Bank declaration for a selected period' },
  {
    type: 'Profit/expense (credit loan)',
    description: 'Profit/expense for credit loan (range supported)',
  },
  { type: 'Custom guided', description: 'Guided custom request' },
];

const demoRequests: Request[] = [
  { id: 'r-1', type: 'Balance sheet', period: 'Jan 2026', status: 'Done' },
  { id: 'r-2', type: 'Bank declarations', period: 'Last 30 days', status: 'Open' },
  { id: 'r-3', type: 'Custom guided', period: 'Custom range', status: 'Open' },
];

export function RequestsScreen() {
  const theme = useTheme();
  const fg = theme.colors.text;
  const mutedFg = theme.colors.textMuted;
  const border = theme.colors.hairline;

  const navigation = useNavigation();
  const route = useRoute('Requests');

  const [filter, setFilter] = useState<Filter>('Open');
  const [items, setItems] = useState<Request[]>(demoRequests);
  const [newOpen, setNewOpen] = useState(false);

  const [formType, setFormType] = useState<RequestTemplateType>('Balance sheet');
  const [formPeriod, setFormPeriod] = useState(periodOptions[0]);
  const [formDeadline, setFormDeadline] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    if (route.params?.openNew) {
      if (route.params.template) setFormType(route.params.template);
      setNewOpen(true);
      navigation.setParams({ openNew: false, template: undefined });
    }
  }, [navigation, route.params?.openNew, route.params?.template]);

  const filtered = useMemo(() => {
    if (filter === 'All') return items;
    return items.filter(r => r.status === filter);
  }, [filter, items]);

  return (
    <AppScaffold>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <ScreenHeader
                title="Requests"
                right={
                  <IconButton
                    accessibilityLabel="New request"
                    icon={Plus}
                    color={fg}
                    onPress={() => setNewOpen(true)}
                  />
                }
              />

              <SectionCard>
                <View style={styles.chips}>
                  <Chip
                    label="Open"
                    selected={filter === 'Open'}
                    onPress={() => setFilter('Open')}
                  />
                  <Chip
                    label="Done"
                    selected={filter === 'Done'}
                    onPress={() => setFilter('Done')}
                  />
                  <Chip
                    label="All"
                    selected={filter === 'All'}
                    onPress={() => setFilter('All')}
                  />
                </View>
              </SectionCard>
            </View>
          }
          renderItem={({ item }) => (
            <GlassSurface style={styles.rowCard} effect="regular">
              <ListRow
                title={item.type}
                subtitle={item.period}
                right={
                  <Badge
                    label={item.status}
                    tone={item.status === 'Done' ? 'success' : 'warning'}
                  />
                }
                onPress={() => setNewOpen(true)}
              />
            </GlassSurface>
          )}
        />

        <Modal
          animationType="slide"
          visible={newOpen}
          transparent
          onRequestClose={() => setNewOpen(false)}
        >
          <Pressable
            style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
            onPress={() => setNewOpen(false)}
          />
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.sheet },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: fg }]}>New request</Text>
              <IconButton
                accessibilityLabel="Close"
                icon={X}
                color={fg}
                onPress={() => setNewOpen(false)}
              />
            </View>

            <SectionCard title="Type">
              <View style={styles.radioList}>
                {templateOptions.map(opt => (
                  <Pressable
                    key={opt.type}
                    accessibilityRole="button"
                    onPress={() => setFormType(opt.type)}
                    style={({ pressed }) => [
                      styles.radioRow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.radioLeft}>
                      <View
                        style={[
                          styles.radioDot,
                          { borderColor: border },
                          formType === opt.type && {
                            backgroundColor: theme.colors.inverseSurface,
                            borderColor: theme.colors.inverseSurface,
                          },
                        ]}
                      />
                      <View style={styles.radioText}>
                        <Text style={[styles.radioTitle, { color: fg }]}>
                          {opt.type}
                        </Text>
                        <Text style={[styles.radioDesc, { color: mutedFg }]}>
                          {opt.description}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </SectionCard>

            <SectionCard title="Period">
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  const idx = periodOptions.indexOf(formPeriod);
                  setFormPeriod(periodOptions[(idx + 1) % periodOptions.length]);
                }}
                style={({ pressed }) => [
                  styles.periodButton,
                  { borderColor: border },
                  pressed && styles.pressed,
                ]}
              >
                <Calendar size={16} color={fg} />
                <Text style={[styles.periodText, { color: fg }]}>{formPeriod}</Text>
                <Text style={[styles.periodHint, { color: mutedFg }]}>Tap to change</Text>
              </Pressable>
            </SectionCard>

            <SectionCard title="Deadline">
              <TextInput
                placeholder="e.g. 2026-02-15"
                placeholderTextColor={theme.colors.placeholder}
                value={formDeadline}
                onChangeText={setFormDeadline}
                style={[styles.input, { color: fg, borderColor: border }]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </SectionCard>

            <SectionCard title="Notes">
              <TextInput
                placeholder="Purpose, attachments, extra context..."
                placeholderTextColor={theme.colors.placeholder}
                value={formNotes}
                onChangeText={setFormNotes}
                style={[styles.textarea, { color: fg, borderColor: border }]}
                multiline
              />
            </SectionCard>

            <View style={styles.sheetActions}>
              <Button
                title="Submit"
                onPress={() => {
                  const id = `r-${Date.now()}`;
                  setItems(prev => [
                    { id, type: formType, period: formPeriod, status: 'Open' },
                    ...prev,
                  ]);
                  setNewOpen(false);
                  setFormDeadline('');
                  setFormNotes('');
                }}
              />
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
    gap: 10,
  },
  headerWrap: {
    gap: 10,
    paddingBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
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
  radioList: {
    gap: 10,
  },
  radioRow: {
    paddingVertical: 8,
    borderRadius: 14,
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    marginTop: 2,
  },
  radioText: {
    flex: 1,
    gap: 3,
  },
  radioTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  radioDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  periodHint: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  sheetActions: {
    paddingTop: 2,
  },
});
