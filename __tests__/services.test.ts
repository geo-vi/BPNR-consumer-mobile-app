import { discoverErp } from '../app/services/erpDiscovery';
import { fetchCompanies } from '../app/services/companies';

function getAxiosMock(): any {
  return (globalThis as any).__BPNR_AXIOS_MOCK__;
}

beforeEach(() => {
  const mock = getAxiosMock();
  mock?.resetHistory?.();
});

test('discoverErp uses mocked erp.json', async () => {
  const discovery = await discoverErp('https://erp.acme.example');

  expect(discovery.realm).toBe('acme');
  expect(discovery.clientId).toBe('bpnr-mobile');
  expect(discovery.apiBaseUrl).toBe('https://erp.acme.example');
  expect(discovery.oidcIssuer).toBe('https://erp.acme.example/auth/realms/acme');

  const mock = getAxiosMock();
  expect(
    mock.history.get.some((req: any) =>
      String(req.url).endsWith('/.well-known/erp.json'),
    ),
  ).toBe(true);
});

test('fetchCompanies uses mocked companies', async () => {
  const companies = await fetchCompanies('https://erp.acme.example', 'token');

  expect(companies).toEqual([
    { id: 'geovi-it-ltd', name: 'Geovi IT Ltd' },
    { id: 'it-works-ltd', name: 'IT Works Ltd' },
    { id: 'acme-ood', name: 'ACME OOD' },
    { id: 'acme-retail', name: 'ACME Retail' },
  ]);

  const mock = getAxiosMock();
  expect(
    mock.history.get.some((req: any) => String(req.url).endsWith('/api/companies')),
  ).toBe(true);
});
