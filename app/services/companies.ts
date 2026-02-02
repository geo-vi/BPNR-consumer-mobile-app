import { getJson } from './apiClient';
import { trimTrailingSlash } from './url';

export type Company = {
  id: string;
  name: string;
};

export async function fetchCompanies(
  apiBaseUrl: string,
  accessToken: string,
): Promise<Company[]> {
  const url = `${trimTrailingSlash(apiBaseUrl)}/api/companies`;
  const raw = await getJson<unknown>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return parseCompanies(raw);
}

function parseCompanies(raw: unknown): Company[] {
  const list = normalizeCompaniesArray(raw);

  const companies: Company[] = [];
  for (const item of list) {
    if (!isRecord(item)) continue;
    const id =
      readString(item, 'id') ??
      readString(item, 'companyId') ??
      readString(item, 'uuid');
    const name =
      readString(item, 'name') ??
      readString(item, 'displayName') ??
      readString(item, 'legalName');
    if (!id || !name) continue;
    companies.push({ id, name });
  }

  if (companies.length === 0) {
    throw new Error('No companies available');
  }

  return companies;
}

function normalizeCompaniesArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (isRecord(raw) && Array.isArray(raw.companies)) return raw.companies;
  throw new Error('Invalid companies response');
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
