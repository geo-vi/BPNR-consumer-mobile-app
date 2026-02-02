import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Calendar, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScaffold } from '../components/ui/AppScaffold';
import { Badge } from '../components/ui/Badge';
import { Chip } from '../components/ui/Chip';
import { GlassSurface } from '../components/ui/GlassSurface';
import { ListRow } from '../components/ui/ListRow';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { useTheme } from '../theme/ThemeProvider';

type Direction = 'in' | 'out';

type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  counterparty: string;
  amount: number; // positive number
  direction: Direction;
  note?: string;
  flags?: Array<'Needs doc' | 'No invoice'>;
};

type Filter = 'All' | 'In' | 'Out';

type Period = 'This month' | 'Last 30 days' | 'Last 90 days';

const periodOptions: Period[] = ['This month', 'Last 30 days', 'Last 90 days'];

const demoTransactions: Transaction[] = [
  {
    id: 't-1',
    date: '2026-02-02',
    counterparty: 'Globex',
    amount: 1240,
    direction: 'in',
    note: 'Invoice #1042',
  },
  {
    id: 't-2',
    date: '2026-02-02',
    counterparty: 'Coffee Shop',
    amount: 8.9,
    direction: 'out',
    flags: ['Needs doc'],
  },
  {
    id: 't-3',
    date: '2026-02-01',
    counterparty: 'Rent',
    amount: 1200,
    direction: 'out',
    flags: ['No invoice'],
  },
  {
    id: 't-4',
    date: '2026-01-31',
    counterparty: 'Northwind Traders',
    amount: 399,
    direction: 'in',
    note: 'Subscription',
  },
  {
    id: 't-5',
    date: '2026-01-29',
    counterparty: 'Internet Provider',
    amount: 69.5,
    direction: 'out',
    flags: ['Needs doc'],
  },
];

type Row =
  | { type: 'date'; id: string; date: string }
  | { type: 'txn'; id: string; txn: Transaction };

export function TransactionsScreen() {
  const theme = useTheme();
  const fg = theme.colors.text;
  const mutedFg = theme.colors.textMuted;
  const border = theme.colors.hairline;

  const [filter, setFilter] = useState<Filter>('All');
  const [period, setPeriod] = useState<Period>('This month');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoTransactions
      .filter(t => {
        if (filter === 'In' && t.direction !== 'in') return false;
        if (filter === 'Out' && t.direction !== 'out') return false;
        if (!q) return true;
        return (
          t.counterparty.toLowerCase().includes(q) ||
          (t.note ?? '').toLowerCase().includes(q) ||
          t.date.includes(q)
        );
      })
      .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
  }, [filter, query]);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let lastDate: string | null = null;
    for (const txn of filtered) {
      if (txn.date !== lastDate) {
        out.push({ type: 'date', id: `d-${txn.date}`, date: txn.date });
        lastDate = txn.date;
      }
      out.push({ type: 'txn', id: txn.id, txn });
    }
    return out;
  }, [filtered]);

  const totals = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    for (const t of filtered) {
      if (t.direction === 'in') totalIn += t.amount;
      else totalOut += t.amount;
    }
    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
    };
  }, [filtered]);

  return (
    <AppScaffold>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <ScreenHeader title="Transactions" />
              <SectionCard>
                <View style={styles.controlsRow}>
                  <View style={styles.chips}>
                    <Chip
                      label="All"
                      selected={filter === 'All'}
                      onPress={() => setFilter('All')}
                    />
                    <Chip
                      label="In"
                      selected={filter === 'In'}
                      onPress={() => setFilter('In')}
                    />
                    <Chip
                      label="Out"
                      selected={filter === 'Out'}
                      onPress={() => setFilter('Out')}
                    />
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const next =
                        periodOptions[
                          (periodOptions.indexOf(period) + 1) % periodOptions.length
                        ];
                      setPeriod(next);
                    }}
                  style={({ pressed }) => [
                    styles.periodButton,
                    pressed && styles.pressed,
                    { borderColor: border },
                  ]}
                  >
                    <Calendar size={16} color={fg} />
                    <Text style={[styles.periodText, { color: fg }]}>{period}</Text>
                  </Pressable>
                </View>

                <View style={[styles.searchRow, { borderColor: border }]}>
                  <Search size={16} color={theme.colors.placeholder} />
                  <TextInput
                    placeholder="Search"
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
          ListFooterComponent={
            <View style={styles.footerWrap}>
              <SectionCard title="Totals (period)">
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalLabel, { color: mutedFg }]}>In</Text>
                  <Text style={[styles.totalValue, { color: fg }]}>
                    €{totals.totalIn.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalLabel, { color: mutedFg }]}>Out</Text>
                  <Text style={[styles.totalValue, { color: fg }]}>
                    €{totals.totalOut.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalLabel, { color: mutedFg }]}>Net</Text>
                  <Text style={[styles.totalValue, { color: fg }]}>
                    €{totals.net.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.totalsHint, { color: mutedFg }]}>Read-only in v1.</Text>
              </SectionCard>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return (
                <Text style={[styles.dateHeader, { color: mutedFg }]}>
                  {formatDate(item.date)}
                </Text>
              );
            }

            const txn = item.txn;
            const sign = txn.direction === 'in' ? '+' : '-';
            const amountText = `${sign}€${txn.amount.toFixed(2)}`;
            const amountColor =
              txn.direction === 'in' ? theme.colors.positive : theme.colors.negative;

            return (
              <GlassSurface style={styles.rowCard} effect="regular">
                <ListRow
                  title={txn.counterparty}
                  subtitle={txn.note ?? txn.date}
                  badges={
                    txn.flags?.length ? (
                      <>
                        {txn.flags.map(flag => (
                          <Badge
                            key={flag}
                            label={flag}
                            tone={flag === 'Needs doc' ? 'warning' : 'neutral'}
                          />
                        ))}
                      </>
                    ) : null
                  }
                  right={<Text style={[styles.amount, { color: amountColor }]}>{amountText}</Text>}
                />
              </GlassSurface>
            );
          }}
        />
      </SafeAreaView>
    </AppScaffold>
  );
}

function formatDate(date: string) {
  // YYYY-MM-DD -> YYYY-MM-DD (placeholder for localized formatting)
  return date;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 10,
  },
  headerWrap: {
    gap: 10,
    paddingBottom: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
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
  dateHeader: {
    paddingTop: 6,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.85,
  },
  rowCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
  },
  footerWrap: {
    paddingTop: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 13,
    opacity: 0.85,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  totalsHint: {
    fontSize: 12,
    opacity: 0.85,
  },
});
