import React, { useMemo } from 'react';
import { Alert, Clipboard, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Haptics from '@mhpdev/react-native-haptics';
import { ClipboardList, Copy, FileText, Receipt, Share2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BarChart,
  BubbleChart,
  LineChart,
  PieChart,
  PopulationPyramid,
  RadarChart,
} from 'react-native-gifted-charts';
import { AppScaffold } from '../components/ui/AppScaffold';
import { GlassSurface } from '../components/ui/GlassSurface';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { ListRow } from '../components/ui/ListRow';
import { useI18n } from '../i18n/useI18n';
import type { RequestTemplateType } from '../navigation/types';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

export function HomeScreen() {
  const theme = useTheme();
  const { language, strings: s } = useI18n();
  const chartStyles = useChartStyles();
  const fg = theme.colors.text;
  const mutedFg = theme.colors.textMuted;
  const { width: windowWidth } = useWindowDimensions();

  const navigation = useNavigation();

  const mailboxAddress = 'invoices@acme.example';
  const lastUpdated = useMemo(() => new Date().toLocaleString(language), [language]);
  const chartWidth = Math.max(0, windowWidth - 64);
  const pieRadius = Math.max(72, Math.min(92, Math.floor(chartWidth / 3)));

  const quickActions: Array<{ label: string; type: RequestTemplateType; icon: any }> =
    useMemo(
      () => [
        { label: s.home.quickActionBalanceSheet, type: 'Balance sheet', icon: FileText },
        {
          label: s.home.quickActionBankDeclaration,
          type: 'Bank declarations',
          icon: Receipt,
        },
        {
          label: s.home.quickActionCreditLoan,
          type: 'Profit/expense (credit loan)',
          icon: ClipboardList,
        },
      ],
      [
        s.home.quickActionBalanceSheet,
        s.home.quickActionBankDeclaration,
        s.home.quickActionCreditLoan,
      ],
    );

  const weekLabel = s.home.weekLabel;
  const incomeByWeekData = useMemo(
    () => [
      { value: 3120, label: weekLabel(1) },
      { value: 2840, label: weekLabel(2) },
      { value: 3550, label: weekLabel(3) },
      { value: 2970, label: weekLabel(4) },
    ],
    [weekLabel],
  );

  const expenseCategoriesData = useMemo(
    () => [
      { value: 2400, label: s.home.expenseRent },
      { value: 1850, label: s.home.expenseSupplies },
      { value: 920, label: s.home.expenseTravel },
      { value: 640, label: s.home.expenseSoftware },
    ],
    [
      s.home.expenseRent,
      s.home.expenseSupplies,
      s.home.expenseTravel,
      s.home.expenseSoftware,
    ],
  );

  const cashflowTrendData = useMemo(() => {
    const values = [4100, 3650, 4820, 4380, 5100, 4950];
    const now = new Date();
    return values.map((value, index) => {
      const monthIndex = values.length - 1 - index;
      const date = new Date(now.getFullYear(), now.getMonth() - monthIndex, 1);
      const label = date.toLocaleString(language, { month: 'short' });
      return { value, label };
    });
  }, [language]);

  const expenseMixData = useMemo(
    () => [
      { value: 2400, color: theme.colors.negative, text: s.home.expenseMixRent },
      { value: 1850, color: theme.colors.accent, text: s.home.expenseMixOps },
      {
        value: 920,
        color: theme.colors.textMuted,
        text: s.home.expenseMixTravel,
      },
      {
        value: 640,
        color: theme.colors.positive,
        text: s.home.expenseMixSoftware,
      },
    ],
    [
      s.home.expenseMixOps,
      s.home.expenseMixRent,
      s.home.expenseMixSoftware,
      s.home.expenseMixTravel,
      theme.colors.accent,
      theme.colors.negative,
      theme.colors.positive,
      theme.colors.textMuted,
    ],
  );

  const agingData = useMemo(
    () => [
      { left: 3, right: 2, yAxisLabel: s.home.aging0to7 },
      { left: 5, right: 4, yAxisLabel: s.home.aging8to30 },
      { left: 2, right: 3, yAxisLabel: s.home.aging31to60 },
      { left: 1, right: 2, yAxisLabel: s.home.aging60plus },
    ],
    [s.home.aging0to7, s.home.aging31to60, s.home.aging60plus, s.home.aging8to30],
  );

  const transactionBubblesData = useMemo(
    () => [
      { x: 2, y: 680, r: 10, bubbleColor: theme.colors.accent },
      { x: 7, y: 1240, r: 14, bubbleColor: theme.colors.positive },
      { x: 13, y: 320, r: 9, bubbleColor: theme.colors.textMuted },
      { x: 21, y: 1950, r: 18, bubbleColor: theme.colors.negative },
      { x: 28, y: 860, r: 12, bubbleColor: theme.colors.accent },
    ],
    [theme.colors.accent, theme.colors.negative, theme.colors.positive, theme.colors.textMuted],
  );

  return (
    <AppScaffold>
      <Screen
        edges={['left', 'right', 'bottom']}
        contentContainerStyle={styles.container}
        style={styles.transparentScreen}
      >
        <ScreenHeader
          title={s.home.dashboard}
          subtitle={s.home.lastUpdated(lastUpdated)}
        />

        <SectionCard title={s.home.balanceSnapshot}>
          <View style={styles.metricsRow}>
            <Metric label={s.home.incomeMtd} value="€12,480" />
            <Metric label={s.home.expensesMtd} value="€7,930" />
          </View>
          <View style={styles.metricsRow}>
            <Metric label={s.home.netMtd} value="€4,550" />
            <Metric label={s.home.cash} value="€28,120" />
          </View>
        </SectionCard>

        <SectionCard title={s.home.incomePrediction}>
          <Text style={[styles.bigValue, { color: fg }]}>€15,900</Text>
          <Text style={[styles.muted, { color: mutedFg }]}>
            {s.home.incomePredictionDisclaimer}
          </Text>
          <Text style={[styles.muted, { color: mutedFg }]}>
            {s.home.predictionLastUpdated(lastUpdated)}
          </Text>
        </SectionCard>

        <SectionCard
          title={s.home.invoiceCompleteness}
          footer={
            <View style={styles.inlineActions}>
              <Button
                title={s.home.submitMissingInvoices}
                onPress={() => navigation.navigate('Documents')}
              />
            </View>
          }
        >
          <Text style={[styles.muted, { color: mutedFg }]}>
            {s.home.invoiceCompletenessDisclaimer}
          </Text>
          <View style={styles.mailboxRow}>
            <View style={styles.mailboxLeft}>
              <Text style={[styles.mailboxLabel, { color: mutedFg }]}>
                {s.home.mailbox}
              </Text>
              <Text style={[styles.mailboxValue, { color: fg }]}>
                {mailboxAddress}
              </Text>
            </View>
            <View style={styles.mailboxActions}>
              <IconButton
                accessibilityLabel={s.home.copyMailboxAddressA11y}
                icon={Copy}
                color={fg}
                onPress={() => copyToClipboard(mailboxAddress, s.home)}
              />
              <IconButton
                accessibilityLabel={s.home.shareMailboxAddressA11y}
                icon={Share2}
                color={fg}
                onPress={() => Share.share({ message: mailboxAddress })}
              />
            </View>
          </View>
        </SectionCard>

        <SectionCard title={s.home.quickActionsRequests}>
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

        <SectionCard title={s.home.chartsSamples}>
          <Text style={[styles.muted, { color: mutedFg }]}>
            {s.home.chartsSamplesDescription}
          </Text>

          <ChartSample title={s.home.incomeByWeek}>
            <BarChart
              data={incomeByWeekData}
              width={chartWidth}
              height={150}
              barWidth={18}
              spacing={22}
              initialSpacing={12}
              disableScroll
              hideRules
              hideYAxisText
              xAxisColor={theme.colors.separator}
              yAxisColor={theme.colors.separator}
              xAxisLabelTextStyle={chartStyles.axisLabel}
              frontColor={theme.colors.accent}
              backgroundColor="transparent"
            />
          </ChartSample>

          <ChartSample title={s.home.topExpenseCategories}>
            <BarChart
              data={expenseCategoriesData}
              width={chartWidth}
              height={150}
              barWidth={14}
              spacing={14}
              initialSpacing={12}
              horizontal
              disableScroll
              hideRules
              hideYAxisText
              xAxisColor={theme.colors.separator}
              yAxisColor={theme.colors.separator}
              xAxisLabelTextStyle={chartStyles.axisLabel}
              frontColor={theme.colors.accent}
              backgroundColor="transparent"
            />
          </ChartSample>

          <Text style={[styles.muted, { color: mutedFg }]}>
            {s.home.cashflowTip}
          </Text>

          <ChartSample title={s.home.cashflowTrend}>
            <LineChart
              data={cashflowTrendData}
              width={chartWidth}
              height={160}
              areaChart
              initialSpacing={0}
              endSpacing={0}
              hideDataPoints
              disableScroll
              hideRules
              hideYAxisText
              color={theme.colors.accent}
              strokeDashArray={[3, 3]}
              startFillColor={theme.colors.accent}
              endFillColor={theme.colors.background}
              startOpacity={0.32}
              endOpacity={0.02}
              xAxisColor={theme.colors.separator}
              yAxisColor={theme.colors.separator}
              xAxisLabelTextStyle={chartStyles.axisLabel}
              pointerConfig={{
                activatePointersInstantlyOnTouch: true,
                showPointerStrip: true,
                pointerStripWidth: 1,
                pointerStripColor: theme.colors.separator,
                pointerStripUptoDataPoint: true,
                radius: 5,
                pointerColor: theme.colors.accent,
                pointerLabelWidth: 140,
                pointerLabelHeight: 48,
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: renderCashflowPointerLabel,
              }}
              backgroundColor="transparent"
            />
          </ChartSample>

          <ChartSample title={s.home.expenseMix}>
            <View style={styles.center}>
              <PieChart
                data={expenseMixData}
                donut
                radius={pieRadius}
                innerRadius={Math.floor(pieRadius * 0.62)}
                innerCircleColor={theme.colors.surface}
                textColor={fg}
                showText
                backgroundColor="transparent"
              />
            </View>
          </ChartSample>

          <ChartSample title={s.home.aging}>
            <PopulationPyramid
              data={agingData}
              width={chartWidth}
              height={220}
              hideRules
              showMidAxis
              midAxisColor={theme.colors.separator}
              xAxisColor={theme.colors.separator}
              yAxisColor={theme.colors.separator}
            />
          </ChartSample>

          <ChartSample title={s.home.companySignals}>
            <View style={styles.center}>
              <RadarChart
                data={[72, 58, 81, 44, 66]}
                labels={[...s.home.radarLabels]}
                chartSize={Math.min(260, chartWidth)}
                noOfSections={5}
                polygonConfig={{
                  stroke: theme.colors.accent,
                  fill: theme.colors.accent,
                  opacity: 0.25,
                }}
                gridConfig={{
                  stroke: theme.colors.separator,
                  opacity: 0.8,
                }}
                labelConfig={{
                  fontSize: 11,
                  stroke: mutedFg,
                  fontWeight: '700',
                }}
              />
            </View>
          </ChartSample>

          <ChartSample title={s.home.transactionsBubble}>
            <BubbleChart
              data={transactionBubblesData}
              width={chartWidth}
              height={220}
              maxX={31}
              maxY={2200}
              xNoOfSections={6}
              yNoOfSections={5}
              disableScroll
              hideRules
              hideYAxisText
              xAxisColor={theme.colors.separator}
              yAxisColor={theme.colors.separator}
              xAxisLabelTextStyle={chartStyles.axisLabel}
              yAxisTextStyle={chartStyles.axisLabel}
              backgroundColor="transparent"
            />
          </ChartSample>
        </SectionCard>

        <SectionCard title={s.home.recentActivity}>
          <View style={styles.list}>
            <ListRow
              title={s.home.invoicePaid}
              subtitle={`Globex · €1,240 · ${s.home.today}`}
              right={
                <Text style={[styles.rowRight, { color: mutedFg }]}>{s.home.view}</Text>
              }
              onPress={() => navigation.navigate('Documents')}
            />
            <ListRow
              title={s.home.newBankTransaction}
              subtitle={`ACME Bank · -€89.20 · ${s.home.yesterday}`}
              right={
                <Text style={[styles.rowRight, { color: mutedFg }]}>{s.home.open}</Text>
              }
              onPress={() => navigation.navigate('Transactions')}
            />
            <ListRow
              title={s.home.requestCompleted}
              subtitle={`${s.home.quickActionBalanceSheet} · ${s.home.jan2026} · ${s.home.done}`}
              right={
                <Text style={[styles.rowRight, { color: mutedFg }]}>
                  {s.home.download}
                </Text>
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
  center: {
    alignItems: 'center',
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

function ChartSample({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) {
  const theme = useTheme();
  return (
    <View style={chartSampleStyles.wrap}>
      <Text style={[chartSampleStyles.title, { color: theme.colors.textMuted }]}>
        {title}
      </Text>
      <View style={chartSampleStyles.chart}>{children}</View>
    </View>
  );
}

const chartSampleStyles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    opacity: 0.85,
  },
  chart: {
    alignItems: 'center',
  },
});

type PointerItem = {
  value?: number;
  label?: string;
};

function CashflowPointerLabel({
  items,
  pointerIndex,
}: {
  items: PointerItem[];
  pointerIndex: number;
}) {
  const theme = useTheme();
  const { strings: s } = useI18n();
  const lastPointerIndexRef = React.useRef<number | null>(null);
  const lastHapticAtRef = React.useRef(0);

  React.useEffect(() => {
    if (pointerIndex < 0) return;
    if (lastPointerIndexRef.current === pointerIndex) return;
    lastPointerIndexRef.current = pointerIndex;

    if ((globalThis as any).__RN_JEST__ === true) return;

    const now = Date.now();
    if (now - lastHapticAtRef.current < 60) return;
    lastHapticAtRef.current = now;

    Haptics.selection().catch(() => {});
  }, [pointerIndex]);

  const item = items?.[0];
  const label = item?.label ?? s.home.point(pointerIndex + 1);
  const value = typeof item?.value === 'number' ? formatEuro(item.value) : '—';

  return (
    <GlassSurface
      effect="regular"
      style={[pointerLabelStyles.wrap, { borderColor: theme.colors.border }]}
    >
      <View style={pointerLabelStyles.inner}>
        <Text style={[pointerLabelStyles.label, { color: theme.colors.textMuted }]}>
          {label}
        </Text>
        <Text style={[pointerLabelStyles.value, { color: theme.colors.text }]}>
          {value}
        </Text>
      </View>
    </GlassSurface>
  );
}

function renderCashflowPointerLabel(
  items: PointerItem[],
  _secondaryItems: unknown[],
  pointerIndex: number,
) {
  return <CashflowPointerLabel items={items} pointerIndex={pointerIndex} />;
}

const pointerLabelStyles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.85,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
  },
});

const useChartStyles = makeStyles(theme => ({
  axisLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
}));

function formatEuro(value: number) {
  return `€${Math.round(value).toLocaleString()}`;
}

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

function copyToClipboard(
  value: string,
  labels: {
    copiedTitle: string;
    mailboxCopiedBody: string;
    copyUnavailableTitle: string;
    copyUnavailableBody: string;
  },
) {
  try {
    Clipboard.setString(value);
    Alert.alert(labels.copiedTitle, labels.mailboxCopiedBody);
  } catch {
    Alert.alert(labels.copyUnavailableTitle, labels.copyUnavailableBody);
  }
}
