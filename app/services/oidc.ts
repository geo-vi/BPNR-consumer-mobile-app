import { Linking } from 'react-native';
import { getJson, postForm } from './apiClient';
import { logger } from './logger';
import { trimTrailingSlash } from './url';
import { isApiMockingEnabled } from './apiMocks';

export type OidcTokens = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

export type OidcLoginParams = {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scope: string;
};

type OpenIdConfiguration = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
};

type WebCrypto = {
  getRandomValues: (array: Uint8Array) => Uint8Array;
  subtle: {
    digest: (algorithm: string, data: ArrayBufferView | ArrayBuffer) => Promise<ArrayBuffer>;
  };
};

const defaultTimeoutMs = 5 * 60 * 1000;

export async function loginWithPkce(params: OidcLoginParams): Promise<OidcTokens> {
  if (isApiMockingEnabled()) {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  const crypto = requireWebCrypto();
  const openIdConfig = await fetchOpenIdConfiguration(params.issuer);

  const codeVerifier = base64UrlEncode(randomBytes(32, crypto));
  const codeChallenge = await codeChallengeS256(codeVerifier, crypto);
  const state = base64UrlEncode(randomBytes(16, crypto));

  const authorizationUrl = buildAuthorizationUrl(openIdConfig.authorizationEndpoint, {
    clientId: params.clientId,
    redirectUri: params.redirectUri,
    scope: params.scope,
    state,
    codeChallenge,
  });

  logger.info('OIDC: opening authorization URL');
  await Linking.openURL(authorizationUrl);

  const redirectUrl = await waitForRedirect(params.redirectUri, defaultTimeoutMs);
  const redirect = parseRedirectUrl(redirectUrl);

  if (redirect.error) {
    const details = redirect.errorDescription ? `: ${redirect.errorDescription}` : '';
    throw new Error(`${redirect.error}${details}`);
  }

  if (!redirect.code) {
    throw new Error('Missing authorization code');
  }

  if (redirect.state !== state) {
    throw new Error('Invalid login state');
  }

  const tokenResponse = await exchangeCodeForToken(openIdConfig.tokenEndpoint, {
    clientId: params.clientId,
    redirectUri: params.redirectUri,
    code: redirect.code,
    codeVerifier,
  });

  return tokenResponse;
}

async function fetchOpenIdConfiguration(issuer: string): Promise<OpenIdConfiguration> {
  const base = trimTrailingSlash(issuer);
  const url = `${base}/.well-known/openid-configuration`;
  const raw = await getJson<unknown>(url);

  if (!isRecord(raw)) {
    throw new Error('Invalid OIDC configuration');
  }

  const authorizationEndpoint = readString(raw, 'authorization_endpoint');
  const tokenEndpoint = readString(raw, 'token_endpoint');

  if (!authorizationEndpoint || !tokenEndpoint) {
    throw new Error('OIDC configuration missing endpoints');
  }

  return { authorizationEndpoint, tokenEndpoint };
}

function buildAuthorizationUrl(
  authorizationEndpoint: string,
  params: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state: string;
    codeChallenge: string;
  },
): string {
  const query = formUrlEncode({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    scope: params.scope,
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
  });

  const hasQuery = authorizationEndpoint.includes('?');
  return `${authorizationEndpoint}${hasQuery ? '&' : '?'}${query}`;
}

async function exchangeCodeForToken(
  tokenEndpoint: string,
  params: {
    clientId: string;
    redirectUri: string;
    code: string;
    codeVerifier: string;
  },
): Promise<OidcTokens> {
  const body = formUrlEncode({
    grant_type: 'authorization_code',
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    code: params.code,
    code_verifier: params.codeVerifier,
  });

  const json = (await postForm<unknown>(tokenEndpoint, body)) as unknown;
  if (!isRecord(json)) {
    throw new Error('Invalid token response');
  }

  const accessToken = readString(json, 'access_token');
  if (!accessToken) {
    throw new Error('Token response missing access_token');
  }

  return {
    accessToken,
    refreshToken: readString(json, 'refresh_token'),
    idToken: readString(json, 'id_token'),
    expiresIn: readNumber(json, 'expires_in'),
    tokenType: readString(json, 'token_type'),
  };
}

function waitForRedirect(redirectUri: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timeoutId = setTimeout(() => {
      settled = true;
      subscription.remove();
      reject(new Error('Login timed out'));
    }, timeoutMs);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (!url.startsWith(redirectUri)) return;
      if (settled) return;

      settled = true;
      clearTimeout(timeoutId);
      subscription.remove();
      resolve(url);
    });

    Linking.getInitialURL()
      .then(initialUrl => {
        if (!initialUrl) return;
        if (settled) return;
        if (!initialUrl.startsWith(redirectUri)) return;

        settled = true;
        clearTimeout(timeoutId);
        subscription.remove();
        resolve(initialUrl);
      })
      .catch(() => {});
  });
}

function parseRedirectUrl(url: string): {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
} {
  const query = parseQueryParams(url);
  return {
    code: query.code,
    state: query.state,
    error: query.error,
    errorDescription: query.error_description,
  };
}

function requireWebCrypto(): WebCrypto {
  const crypto = (globalThis as any).crypto as WebCrypto | undefined;
  if (!crypto?.getRandomValues || !crypto?.subtle?.digest) {
    throw new Error('WebCrypto is not available on this device');
  }
  return crypto;
}

function randomBytes(length: number, crypto: WebCrypto): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function codeChallengeS256(codeVerifier: string, crypto: WebCrypto): Promise<string> {
  const input = utf8Encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return base64UrlEncode(new Uint8Array(digest));
}

function utf8Encode(value: string): Uint8Array {
  const TextEncoderConstructor = (globalThis as any).TextEncoder as
    | (new () => { encode: (input: string) => Uint8Array })
    | undefined;

  if (TextEncoderConstructor) {
    return new TextEncoderConstructor().encode(value);
  }

  const escaped = encodeURIComponent(value);
  const bytes: number[] = [];

  for (let i = 0; i < escaped.length; i++) {
    const char = escaped.charAt(i);
    if (char === '%') {
      bytes.push(parseInt(escaped.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }

  return new Uint8Array(bytes);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let output = base64Encode(bytes);
  output = output.split('+').join('-');
  output = output.split('/').join('_');
  return output.replace(/=+$/g, '');
}

function base64Encode(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const triplet = (b1 << 16) | (b2 << 8) | b3;
    output += alphabet[(triplet >> 18) & 0x3f];
    output += alphabet[(triplet >> 12) & 0x3f];
    output += i + 1 < bytes.length ? alphabet[(triplet >> 6) & 0x3f] : '=';
    output += i + 2 < bytes.length ? alphabet[triplet & 0x3f] : '=';
  }

  return output;
}

function formUrlEncode(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function parseQueryParams(url: string): Record<string, string | undefined> {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return {};

  const hashStart = url.indexOf('#', queryStart);
  const queryString =
    hashStart === -1 ? url.slice(queryStart + 1) : url.slice(queryStart + 1, hashStart);

  const params: Record<string, string | undefined> = {};
  for (const part of queryString.split('&')) {
    if (!part) continue;
    const [rawKey, rawValue] = part.split('=', 2);
    if (!rawKey) continue;
    const key = decodeURIComponent(rawKey);
    const value = rawValue ? decodeURIComponent(rawValue) : '';
    params[key] = value;
  }

  return params;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
