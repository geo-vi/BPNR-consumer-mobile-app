import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { ErpDiscovery } from '../services/erpDiscovery';

const storage = createJSONStorage<any>(() => AsyncStorage);

export type Company = {
  id: string;
  name: string;
};

export const companiesAtom = atom<Company[]>([]);

export const notificationsUnreadCountAtom = atomWithStorage<number>(
  'notificationsUnreadCount',
  3,
  storage,
  { getOnInit: true },
);

export const serverUrlAtom = atomWithStorage<string>('serverUrl', '', storage, {
  getOnInit: true,
});

export const erpDiscoveryAtom = atomWithStorage<ErpDiscovery | null>(
  'erpDiscovery',
  null,
  storage,
  { getOnInit: true },
);

export const accessTokenAtom = atom<string | null>(null);
export const refreshTokenAtom = atom<string | null>(null);

export const selectedCompanyByServerUrlAtom = atomWithStorage<Record<string, string>>(
  'selectedCompanyByServerUrl',
  {},
  storage,
  { getOnInit: true },
);

export const selectedCompanyIdAtom = atom(
  get => {
    const serverUrl = get(serverUrlAtom) as string;
    if (!serverUrl) return '';
    const selectedByServerUrlValue = get(selectedCompanyByServerUrlAtom);
    if (isPromiseLike(selectedByServerUrlValue)) return '';
    return (selectedByServerUrlValue as Record<string, string>)[serverUrl] ?? '';
  },
  (get, set, companyId: string) => {
    const serverUrl = get(serverUrlAtom) as string;
    if (!serverUrl) return;

    set(selectedCompanyByServerUrlAtom, prev => {
      const base = isPromiseLike(prev) ? {} : prev;
      const next = { ...(base as Record<string, string>) };
      if (!companyId) {
        delete next[serverUrl];
      } else {
        next[serverUrl] = companyId;
      }
      return next;
    });
  },
);

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return value !== null && typeof value === 'object' && 'then' in value;
}

export const selectedCompanyAtom = atom(get => {
  const companies = get(companiesAtom);
  const selectedCompanyId = get(selectedCompanyIdAtom) as string;
  return companies.find(c => c.id === selectedCompanyId) ?? companies[0] ?? null;
});

export const isOnboardedAtom = atom(get => {
  const serverUrl = get(serverUrlAtom) as string;
  const discovery = get(erpDiscoveryAtom);
  const accessToken = get(accessTokenAtom);
  const selectedCompanyId = get(selectedCompanyIdAtom) as string;
  const companies = get(companiesAtom);

  const hasCompanyContext =
    Boolean(selectedCompanyId) && companies.some(c => c.id === selectedCompanyId);

  return Boolean(serverUrl && discovery && accessToken && hasCompanyContext);
});

export type NotificationPrefs = {
  bankTransactions: boolean;
  invoices: boolean;
  missingDocuments: boolean;
  accountantMessages: boolean;
};

export const notificationPrefsAtom = atomWithStorage<NotificationPrefs>(
  'notificationPrefs',
  {
    bankTransactions: true,
    invoices: true,
    missingDocuments: true,
    accountantMessages: true,
  },
  storage,
  { getOnInit: true },
);
