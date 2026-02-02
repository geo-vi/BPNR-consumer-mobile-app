import { getJson } from './apiClient';
import { trimTrailingSlash } from './url';

export type ErpDiscovery = {
  oidcIssuer: string;
  apiBaseUrl: string;
  realm?: string;
  clientId?: string;
  modules?: string[];
};

export async function discoverErp(serverUrl: string): Promise<ErpDiscovery> {
  const base = trimTrailingSlash(serverUrl);
  const discoveryUrl = `${base}/.well-known/erp.json`;
  const raw = await getJson<unknown>(discoveryUrl);
  return parseErpDiscovery(raw, base);
}

function parseErpDiscovery(raw: unknown, serverUrl: string): ErpDiscovery {
  if (!isRecord(raw)) {
    throw new Error('Invalid discovery document');
  }

  const oidc = isRecord(raw.oidc) ? raw.oidc : undefined;
  const api = isRecord(raw.api) ? raw.api : undefined;

  const oidcIssuer =
    readString(raw, 'oidcIssuer') ??
    readString(raw, 'oidc_issuer') ??
    readString(raw, 'issuer') ??
    (oidc ? readString(oidc, 'issuer') : undefined);

  if (!oidcIssuer) {
    throw new Error('Discovery document missing OIDC issuer');
  }

  const apiBaseUrl =
    readString(raw, 'apiBaseUrl') ??
    readString(raw, 'api_base_url') ??
    (api ? readString(api, 'baseUrl') ?? readString(api, 'baseURL') : undefined) ??
    serverUrl;

  const realm =
    readString(raw, 'realm') ??
    readString(raw, 'keycloakRealm') ??
    (oidc ? readString(oidc, 'realm') : undefined) ??
    inferKeycloakRealm(oidcIssuer);

  const clientId =
    readString(raw, 'clientId') ??
    readString(raw, 'oidcClientId') ??
    (oidc ? readString(oidc, 'clientId') : undefined);

  const modules = Array.isArray(raw.modules)
    ? raw.modules.filter(isString)
    : undefined;

  return {
    oidcIssuer: trimTrailingSlash(oidcIssuer),
    apiBaseUrl: trimTrailingSlash(apiBaseUrl),
    realm,
    clientId,
    modules,
  };
}

function inferKeycloakRealm(issuer: string): string | undefined {
  const marker = '/realms/';
  const index = issuer.indexOf(marker);
  if (index === -1) return undefined;
  const rest = issuer.slice(index + marker.length);
  const realm = rest.split(/[/?#]/)[0];
  return realm || undefined;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
