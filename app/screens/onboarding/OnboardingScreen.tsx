import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowRight, Delete, MessageCircle, ScanQrCode } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { Screen } from '../../components/ui/Screen';
import { fetchCompanies, type Company } from '../../services/companies';
import { discoverErp } from '../../services/erpDiscovery';
import { loginWithPkce } from '../../services/oidc';
import { normalizeServerUrl } from '../../services/url';
import {
  accessTokenAtom,
  companiesAtom,
  erpDiscoveryAtom,
  refreshTokenAtom,
  selectedCompanyIdAtom,
  serverUrlAtom,
} from '../../state/session';
import { useMockApiAtom } from '../../state/settings';
import { useTheme } from '../../theme/ThemeProvider';

type Step = 'connect' | 'checking' | 'login' | 'company';

type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: string };

const ONBOARDING_BACKGROUND_IMAGE_URI =
  'https://images.pexels.com/photos/5531617/pexels-photo-5531617.jpeg';

const PRE_SAVED_COMPANIES = [
  { id: 'geovi-it-ltd', name: 'Geovi IT Ltd' },
  { id: 'it-works-ltd', name: 'IT Works Ltd' },
] as const;

const SAVED_COMPANY_PIN_LENGTH = 4;

export function OnboardingScreen() {
  const theme = useTheme();

  const serverUrl = useAtomValue(serverUrlAtom);
  const discovery = useAtomValue(erpDiscoveryAtom);
  const accessToken = useAtomValue(accessTokenAtom);
  const savedCompanyId = useAtomValue(selectedCompanyIdAtom);

  const setServerUrl = useSetAtom(serverUrlAtom);
  const setDiscovery = useSetAtom(erpDiscoveryAtom);
  const setAccessToken = useSetAtom(accessTokenAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const setSelectedCompanyId = useSetAtom(selectedCompanyIdAtom);
  const setCompaniesAtom = useSetAtom(companiesAtom);

  const [useMockApi, setUseMockApi] = useAtom(useMockApiAtom);

  const [savedCompanyTarget, setSavedCompanyTarget] = useState<
    (typeof PRE_SAVED_COMPANIES)[number] | null
  >(null);
  const [savedCompanyPin, setSavedCompanyPin] = useState('');

  const [step, setStep] = useState<Step>(() => {
    if (!serverUrl || !discovery) return 'connect';
    if (!accessToken) return 'login';
    return 'company';
  });

  const [serverUrlInput, setServerUrlInput] = useState(serverUrl ?? '');
  const [connectError, setConnectError] = useState<string | null>(null);

  const [discoveryState, setDiscoveryState] = useState<RequestState>({
    status: 'idle',
  });

  const [loginState, setLoginState] = useState<RequestState>({ status: 'idle' });

  const [companiesState, setCompaniesState] = useState<RequestState>({
    status: 'idle',
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(
    savedCompanyId ? savedCompanyId : null,
  );

  const resolvedClientId = discovery?.clientId ?? 'bpnr-mobile';
  const isCompanySelectionValid = companyId !== null && companies.some(c => c.id === companyId);

  const statusLabel = useMemo(() => {
    if (discoveryState.status === 'loading') return 'Checking…';
    if (discoveryState.status === 'success') return 'OK';
    if (discoveryState.status === 'error') return 'Error';
    return '—';
  }, [discoveryState.status]);

  useEffect(() => {
    setServerUrlInput(serverUrl ?? '');
  }, [serverUrl]);

  useEffect(() => {
    setCompanyId(savedCompanyId ? savedCompanyId : null);
  }, [savedCompanyId]);

  useEffect(() => {
    if (step !== 'company') return;
    if (!accessToken || !discovery) return;

    let cancelled = false;
    setCompaniesState({ status: 'loading' });

    fetchCompanies(discovery.apiBaseUrl, accessToken)
      .then(list => {
        if (cancelled) return;
        setCompanies(list);
        setCompaniesAtom(list);
        setCompaniesState({ status: 'success' });
      })
      .catch(err => {
        if (cancelled) return;
        setCompaniesState({ status: 'error', error: errorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, discovery, setCompaniesAtom, step]);

  async function onConnect() {
    const normalized = normalizeServerUrl(serverUrlInput);
    if (!normalized) {
      setConnectError('Enter a valid server URL.');
      return;
    }

    setConnectError(null);
    setDiscoveryState({ status: 'loading' });
    setAccessToken(null);
    setRefreshToken(null);
    setCompaniesAtom([]);
    setServerUrl(normalized);
    setDiscovery(null);
    setStep('checking');

    try {
      const doc = await discoverErp(normalized);
      setDiscovery(doc);
      setDiscoveryState({ status: 'success' });
    } catch (err) {
      setDiscoveryState({ status: 'error', error: errorMessage(err) });
    }
  }

  async function onLogin() {
    if (!discovery) return;

    setLoginState({ status: 'loading' });
    try {
      const tokens = await loginWithPkce({
        issuer: discovery.oidcIssuer,
        clientId: resolvedClientId,
        redirectUri: 'bpnr://auth/callback',
        scope: 'openid profile offline_access',
      });

      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken ?? null);
      setLoginState({ status: 'success' });
      setStep('company');
    } catch (err) {
      setLoginState({ status: 'error', error: errorMessage(err) });
    }
  }

  function onContinueToLogin() {
    setLoginState({ status: 'idle' });
    setStep('login');
  }

  function onRetryDiscovery() {
    setDiscoveryState({ status: 'idle' });
    setStep('connect');
  }

  function onChangeServer() {
    setDiscoveryState({ status: 'idle' });
    setLoginState({ status: 'idle' });
    setCompaniesState({ status: 'idle' });
    setCompanies([]);
    setCompanyId(savedCompanyId ? savedCompanyId : null);
    setStep('connect');
  }

  function onContinueCompany() {
    if (!companyId) return;
    if (!companies.some(c => c.id === companyId)) return;
    setSelectedCompanyId(companyId);
  }

  function onScanQr() {
    Alert.alert('Scan QR', 'Not implemented yet.');
  }

  function onContactAccountant() {
    Alert.alert('Contact accountant', 'Not implemented yet.');
  }

  function onPressSavedCompany(company: (typeof PRE_SAVED_COMPANIES)[number]) {
    setSavedCompanyTarget(company);
    setSavedCompanyPin('');
  }

  function onPressSavedCompanyDigit(digit: number) {
    setSavedCompanyPin(prev => {
      if (prev.length >= SAVED_COMPANY_PIN_LENGTH) return prev;
      return `${prev}${digit}`;
    });
  }

  function onPressSavedCompanyDelete() {
    setSavedCompanyPin(prev => prev.slice(0, -1));
  }

  function onCancelSavedCompanyPin() {
    setSavedCompanyTarget(null);
    setSavedCompanyPin('');
  }

  function onContinueSavedCompanyPin() {
    if (!savedCompanyTarget) return;
    if (savedCompanyPin.length !== SAVED_COMPANY_PIN_LENGTH) return;
    setSavedCompanyTarget(null);
    setSavedCompanyPin('');
    Alert.alert('Saved company', `${savedCompanyTarget.name} unlocked (demo).`);
  }

  if (step === 'connect') {
    return (
      <OnboardingBackgroundScreen
        scroll
        contentContainerStyle={styles.container}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Connect your company
        </Text>

        <GlassSurface style={styles.card} effect="regular" interactive>
          <Text style={[styles.label, { color: theme.colors.text }]}>Server URL</Text>
          <TextInput
            value={serverUrlInput}
            onChangeText={setServerUrlInput}
            placeholder="https://erp.acme.example"
            placeholderTextColor={theme.colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.hairline },
            ]}
          />
          {connectError ? (
            <Text style={[styles.error, { color: theme.colors.notification }]}>
              {connectError}
            </Text>
          ) : null}
          <Button title="Connect" onPress={onConnect} />
        </GlassSurface>

        {__DEV__ ? (
          <GlassSurface style={styles.card} effect="regular" interactive>
            <View style={styles.mockRow}>
              <View style={styles.mockText}>
                <Text style={[styles.mockTitle, { color: theme.colors.text }]}>
                  Use mock backend
                </Text>
                <Text
                  style={[styles.mockSubtitle, { color: theme.colors.textMuted }]}
                >
                  Local fixtures (no real network/OIDC).
                </Text>
              </View>
              <Switch value={useMockApi} onValueChange={setUseMockApi} />
            </View>
          </GlassSurface>
        ) : null}

        <View style={styles.savedCompaniesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Saved companies
          </Text>
          <View style={styles.savedCompaniesList}>
            {PRE_SAVED_COMPANIES.map(company => (
              <GlassSurface
                key={company.id}
                style={styles.savedCompanyCard}
                effect="regular"
                interactive
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Use saved company ${company.name}`}
                  onPress={() => onPressSavedCompany(company)}
                  style={({ pressed }) => [
                    styles.savedCompanyCardContent,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.savedCompanyName, { color: theme.colors.text }]}>
                    {company.name}
                  </Text>
                  <ArrowRight size={18} color={theme.colors.textMuted} />
                </Pressable>
              </GlassSurface>
            ))}
          </View>
        </View>

        <View style={styles.troubleSection}>
          <Text style={[styles.troubleText, { color: theme.colors.text }]}>
            Having trouble?
          </Text>
          <View style={styles.troubleActions}>
            <TroubleAction label="Scan QR" icon={ScanQrCode} onPress={onScanQr} />
            <TroubleAction
              label="Contact accountant"
              icon={MessageCircle}
              onPress={onContactAccountant}
            />
          </View>
        </View>

        <SavedCompanyPinModal
          visible={savedCompanyTarget !== null}
          companyName={savedCompanyTarget?.name ?? ''}
          value={savedCompanyPin}
          length={SAVED_COMPANY_PIN_LENGTH}
          onDigitPress={onPressSavedCompanyDigit}
          onDeletePress={onPressSavedCompanyDelete}
          onCancel={onCancelSavedCompanyPin}
          onContinue={onContinueSavedCompanyPin}
        />
      </OnboardingBackgroundScreen>
    );
  }

  if (step === 'checking') {
    return (
      <OnboardingBackgroundScreen
        scroll
        contentContainerStyle={styles.container}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Checking server…
        </Text>

        <GlassSurface style={styles.card} effect="regular" interactive>
          <Row label="Discovery" value="/.well-known/erp.json" />
          <Row label="Status" value={statusLabel} />
          <Row label="Realm" value={discovery?.realm ?? '—'} />
          <Row label="Issuer" value={discovery?.oidcIssuer ?? '—'} />

          {discoveryState.status === 'loading' ? (
            <View style={styles.inlineSpinner}>
              <ActivityIndicator />
              <Text
                style={[styles.inlineSpinnerText, { color: theme.colors.text }]}
              >
                Contacting server…
              </Text>
            </View>
          ) : null}

          {discoveryState.status === 'error' ? (
            <Text style={[styles.error, { color: theme.colors.notification }]}>
              {discoveryState.error}
            </Text>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable onPress={onChangeServer} accessibilityRole="button">
              <Text
                style={[styles.secondaryAction, { color: theme.colors.accent }]}
              >
                Change server
              </Text>
            </Pressable>
          </View>

          {discoveryState.status === 'success' ? (
            <Button title="Continue to login" onPress={onContinueToLogin} />
          ) : (
            <Button
              title={discoveryState.status === 'loading' ? 'Connecting…' : 'Back'}
              onPress={onRetryDiscovery}
              disabled={discoveryState.status === 'loading'}
            />
          )}
        </GlassSurface>
      </OnboardingBackgroundScreen>
    );
  }

  if (step === 'login') {
    return (
      <OnboardingBackgroundScreen
        scroll
        contentContainerStyle={styles.container}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>Login</Text>

        <GlassSurface style={styles.card} effect="regular" interactive>
          <Row label="Realm" value={discovery?.realm ?? '—'} />
          <Row label="Client" value={resolvedClientId} />

          {loginState.status === 'loading' ? (
            <View style={styles.inlineSpinner}>
              <ActivityIndicator />
              <Text
                style={[styles.inlineSpinnerText, { color: theme.colors.text }]}
              >
                Waiting for login…
              </Text>
            </View>
          ) : null}

          {loginState.status === 'error' ? (
            <Text style={[styles.error, { color: theme.colors.notification }]}>
              {loginState.error}
            </Text>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable onPress={onChangeServer} accessibilityRole="button">
              <Text
                style={[styles.secondaryAction, { color: theme.colors.accent }]}
              >
                Change server
              </Text>
            </Pressable>
          </View>

          <Button
            title={loginState.status === 'loading' ? 'Logging in…' : 'Continue to login'}
            onPress={onLogin}
            disabled={loginState.status === 'loading'}
          />
        </GlassSurface>
      </OnboardingBackgroundScreen>
    );
  }

  return (
    <OnboardingBackgroundScreen
      scroll
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Choose company</Text>

      <GlassSurface style={styles.card} effect="regular" interactive>
        {companiesState.status === 'loading' ? (
          <View style={styles.inlineSpinner}>
            <ActivityIndicator />
            <Text style={[styles.inlineSpinnerText, { color: theme.colors.text }]}>
              Loading companies…
            </Text>
          </View>
        ) : null}

        {companiesState.status === 'error' ? (
          <Text style={[styles.error, { color: theme.colors.notification }]}>
            {companiesState.error}
          </Text>
        ) : null}

        <View style={styles.companyList}>
          {companies.map(company => {
            const selected = company.id === companyId;
            return (
              <Pressable
                key={company.id}
                onPress={() => setCompanyId(company.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[
                  styles.companyRow,
                  { borderColor: theme.colors.hairline },
                  selected && { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.radio,
                    { borderColor: theme.colors.hairline },
                    selected && { borderColor: theme.colors.accent },
                  ]}
                >
                  {selected ? (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: theme.colors.accent },
                      ]}
                    />
                  ) : null}
                </View>
                <Text style={[styles.companyName, { color: theme.colors.text }]}>
                  {company.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={onChangeServer} accessibilityRole="button">
            <Text style={[styles.secondaryAction, { color: theme.colors.accent }]}>
              Change server
            </Text>
          </Pressable>
        </View>

        <Button
          title="Continue"
          onPress={onContinueCompany}
          disabled={!isCompanySelectionValid || companiesState.status !== 'success'}
        />
      </GlassSurface>
    </OnboardingBackgroundScreen>
  );
}

function OnboardingBackgroundScreen({
  children,
  style,
  ...rest
}: React.ComponentProps<typeof Screen>) {
  const theme = useTheme();
  const overlayColor = theme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.4)';

  return (
    <ImageBackground
      source={{ uri: ONBOARDING_BACKGROUND_IMAGE_URI }}
      resizeMode="cover"
      style={[styles.background, { backgroundColor: theme.colors.background }]}
    >
      <View
        pointerEvents="none"
        style={[styles.backgroundOverlay, { backgroundColor: overlayColor }]}
      />
      <Screen {...rest} style={[styles.transparentScreen, style]}>
        {children}
      </Screen>
    </ImageBackground>
  );
}

function TroubleAction({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <GlassSurface style={styles.troubleActionCard} effect="regular" interactive>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [styles.troubleActionButton, pressed && styles.pressed]}
      >
        <View
          style={[
            styles.troubleActionIcon,
            { backgroundColor: theme.tones.neutral.bg },
          ]}
        >
          <Icon size={20} color={theme.colors.accent} />
        </View>
        <Text style={[styles.troubleActionLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
      </Pressable>
    </GlassSurface>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Something went wrong';
}

function SavedCompanyPinModal({
  visible,
  companyName,
  value,
  length,
  onDigitPress,
  onDeletePress,
  onCancel,
  onContinue,
}: {
  visible: boolean;
  companyName: string;
  value: string;
  length: number;
  onDigitPress: (digit: number) => void;
  onDeletePress: () => void;
  onCancel: () => void;
  onContinue: () => void;
}) {
  const theme = useTheme();
  const isComplete = value.length === length;
  const pinDotBorderStyle = useMemo(
    () => ({ borderColor: theme.colors.hairline }),
    [theme.colors.hairline],
  );
  const pinDotFilledStyle = useMemo(
    () => ({ backgroundColor: theme.colors.accent }),
    [theme.colors.accent],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.pinModalOverlay}>
        <GlassSurface style={styles.pinModalCard} effect="regular" interactive>
          <View style={styles.pinModalHeader}>
            <Text style={[styles.pinModalTitle, { color: theme.colors.text }]}>
              Enter code
            </Text>
            <Text style={[styles.pinModalSubtitle, { color: theme.colors.textMuted }]}>
              {companyName}
            </Text>
          </View>

          <View style={styles.pinDots}>
            {Array.from({ length }).map((_, index) => {
              const filled = index < value.length;
              return (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    pinDotBorderStyle,
                    filled && pinDotFilledStyle,
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.keypad}>
            <View style={styles.keypadRow}>
              <KeypadKey label="1" onPress={() => onDigitPress(1)} />
              <KeypadKey label="2" onPress={() => onDigitPress(2)} />
              <KeypadKey label="3" onPress={() => onDigitPress(3)} />
            </View>
            <View style={styles.keypadRow}>
              <KeypadKey label="4" onPress={() => onDigitPress(4)} />
              <KeypadKey label="5" onPress={() => onDigitPress(5)} />
              <KeypadKey label="6" onPress={() => onDigitPress(6)} />
            </View>
            <View style={styles.keypadRow}>
              <KeypadKey label="7" onPress={() => onDigitPress(7)} />
              <KeypadKey label="8" onPress={() => onDigitPress(8)} />
              <KeypadKey label="9" onPress={() => onDigitPress(9)} />
            </View>
            <View style={styles.keypadRow}>
              <View style={styles.keypadSpacer} />
              <KeypadKey label="0" onPress={() => onDigitPress(0)} />
              <KeypadKey
                accessibilityLabel="Delete"
                disabled={value.length === 0}
                onPress={onDeletePress}
              >
                <Delete size={20} color={theme.colors.text} />
              </KeypadKey>
            </View>
          </View>

          <View style={styles.pinModalActions}>
            <Button title="Cancel" variant="secondary" onPress={onCancel} />
            <Button title="Continue" onPress={onContinue} disabled={!isComplete} />
          </View>
        </GlassSurface>
      </View>
    </Modal>
  );
}

function KeypadKey({
  label,
  children,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  label?: string;
  children?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();

  return (
    <GlassSurface style={styles.keypadKeySurface} effect="regular" interactive>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.keypadKeyButton,
          pressed && !disabled && styles.pressed,
          disabled && styles.keypadKeyDisabled,
        ]}
      >
        {label ? (
          <Text style={[styles.keypadKeyText, { color: theme.colors.text }]}>
            {label}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  transparentScreen: {
    backgroundColor: 'transparent',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 16,
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mockText: {
    flex: 1,
    gap: 4,
  },
  mockTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  mockSubtitle: {
    fontSize: 13,
    opacity: 0.85,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  troubleSection: {
    gap: 10,
  },
  troubleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  troubleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  troubleActionCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  troubleActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 84,
  },
  troubleActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  troubleActionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  secondaryAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  inlineSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  inlineSpinnerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  companyList: {
    gap: 8,
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  savedCompaniesSection: {
    gap: 10,
  },
  savedCompaniesList: {
    gap: 12,
  },
  savedCompanyCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  savedCompanyCardContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  savedCompanyName: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  pinModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  pinModalCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 16,
  },
  pinModalHeader: {
    gap: 4,
    marginBottom: 14,
  },
  pinModalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  pinModalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  keypad: {
    gap: 10,
    marginBottom: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  keypadSpacer: {
    flex: 1,
  },
  keypadKeySurface: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  keypadKeyButton: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyDisabled: {
    opacity: 0.45,
  },
  keypadKeyText: {
    fontSize: 22,
    fontWeight: '800',
  },
  pinModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
