export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class HttpError extends Error {
  readonly status: number;
  readonly bodyText: string | null;

  constructor(status: number, bodyText: string | null) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.bodyText = bodyText;
  }
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export async function httpJson<T>(
  url: string,
  options?: Omit<RequestInit, 'body' | 'method'> & {
    method?: HttpMethod;
    body?: Json;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    method: options?.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body:
      options?.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!res.ok) {
    const bodyText = await safeReadText(res);
    throw new HttpError(res.status, bodyText);
  }

  return (await res.json()) as T;
}

async function safeReadText(res: Response): Promise<string | null> {
  try {
    return await res.text();
  } catch {
    return null;
  }
}

