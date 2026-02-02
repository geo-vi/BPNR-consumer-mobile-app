const schemeRegex = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export function normalizeServerUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withScheme = schemeRegex.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const URLConstructor = (globalThis as any).URL as any;
    const url = new URLConstructor(withScheme) as any;
    const protocol = url?.protocol as string | undefined;
    if (protocol !== 'https:' && protocol !== 'http:') return null;
    return (url?.origin as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
