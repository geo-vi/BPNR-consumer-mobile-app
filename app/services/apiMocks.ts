import type AxiosMockAdapter from 'axios-mock-adapter';
import { apiClient } from './apiClient';
import { logger } from './logger';

type AxiosMockAdapterOptions = {
  onNoMatch?: 'passthrough' | 'throwException';
};

let adapter: AxiosMockAdapter | null = null;
type AxiosMockAdapterCtor = new (
  axiosInstance: any,
  options?: AxiosMockAdapterOptions,
) => AxiosMockAdapter;

const DEFAULT_MOCK_COMPANIES = [
  { id: 'geovi-it-ltd', name: 'Geovi IT Ltd' },
  { id: 'it-works-ltd', name: 'IT Works Ltd' },
  { id: 'acme-ood', name: 'ACME OOD' },
  { id: 'acme-retail', name: 'ACME Retail' },
];

export function isApiMockingEnabled(): boolean {
  return Boolean((globalThis as any).__BPNR_AXIOS_MOCK__) || adapter !== null;
}

export function getApiMockAdapter(): AxiosMockAdapter | null {
  return adapter;
}

export function enableApiMocks(
  options: AxiosMockAdapterOptions = { onNoMatch: 'throwException' },
): AxiosMockAdapter {
  if (adapter) return adapter;

  const module = require('axios-mock-adapter');
  const MockAdapter = (module?.default ?? module) as AxiosMockAdapterCtor;

  adapter = new MockAdapter(apiClient, {
    onNoMatch: options.onNoMatch ?? 'throwException',
  });

  (globalThis as any).__BPNR_AXIOS_MOCK__ = adapter;
  (globalThis as any).__BPNR_USE_API_MOCKS__ = true;

  registerDefaultApiMocks(adapter);
  logger.info('API mocks enabled');

  return adapter;
}

export function disableApiMocks() {
  if (!adapter) return;
  adapter.restore();
  adapter = null;
  (globalThis as any).__BPNR_USE_API_MOCKS__ = false;
  delete (globalThis as any).__BPNR_AXIOS_MOCK__;
  logger.info('API mocks disabled');
}

export function registerDefaultApiMocks(mock: AxiosMockAdapter) {
  mock.onGet(/\/\.well-known\/erp\.json$/).reply(config => {
    const base = String(config.url ?? '').replace(/\/\.well-known\/erp\.json$/, '');
    return [
      200,
      {
        oidcIssuer: `${base}/auth/realms/acme`,
        apiBaseUrl: base,
        realm: 'acme',
        clientId: 'bpnr-mobile',
        modules: ['core', 'accounting'],
      },
    ];
  });

  mock.onGet(/\/\.well-known\/openid-configuration$/).reply(config => {
    const issuer = String(config.url ?? '').replace(
      /\/\.well-known\/openid-configuration$/,
      '',
    );
    const base = issuer.replace(/\/+$/, '');
    return [
      200,
      {
        authorization_endpoint: `${base}/protocol/openid-connect/auth`,
        token_endpoint: `${base}/protocol/openid-connect/token`,
      },
    ];
  });

  mock.onPost(/\/protocol\/openid-connect\/token$/).reply(200, {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'Bearer',
    expires_in: 3600,
  });

  mock.onGet(/\/api\/companies$/).reply(200, {
    companies: DEFAULT_MOCK_COMPANIES,
  });
}
