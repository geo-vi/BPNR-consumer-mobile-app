# BPNR Consumer Mobile App (React Native)

## Focus
- The core foundation of the app lives in `app/`. Prefer making product changes inside `app/` unless there is a strong reason otherwise.
- Treat everything outside `app/` (native folders, configs) as infrastructure; keep changes minimal and intentional.

## Tech & conventions
- **UI foundation:** Build new surfaces/components using `@callstack/liquid-glass` (iOS 26+). Always provide graceful fallbacks when `isLiquidGlassSupported` is false.
- **Navigation:** Use React Navigation (`@react-navigation/native` + `bottom-tabs`). Keep route typing centralized in `app/navigation/types.ts` and keep deep links synced in `app/navigation/linking.ts`.
- **Animations:** Use Reanimated for animations. Prefer worklets for performance-sensitive animations; keep JS thread work minimal.
- **Gestures:** Use `react-native-gesture-handler` for any non-trivial gestures; keep `GestureHandlerRootView` as the app root wrapper (see `app/providers/AppProviders.tsx`).
- **State:** Use Jotai.
  - Persistent state: `atomWithStorage` + AsyncStorage for non-sensitive values (e.g., selected company, cached snapshots).
  - Ephemeral/transitional state: component state or non-persistent atoms.
  - Secrets (e.g., refresh tokens): **never** store in AsyncStorage; use secure storage (to be added).
- **Services:** Put networking/auth/discovery clients in `app/services/`. Keep HTTP/auth concerns out of screens.
  - Prefer Axios for API calls (to be added); keep a single configured client with interceptors.
  - Keep logging behind `app/services/logger.ts` so it can be swapped later.
- **Theme:** Keep design tokens in `app/theme/` and reuse across UI components.

## Product intent (do not drift)
- Build a business-owner companion, not an accounting editor: increase visibility + confidence, and reduce friction with the accountant via structured workflows.
- MVP value: turn ad-hoc accountant requests into structured templates; show “company state” signals without making the owner an accountant.
- Explicit non-goals (v1): editing accounting entries/ledger, advanced budgeting, payroll/HR.

## Onboarding & auth (must-have)
- Entry flow is server URL first:
  - User inputs `serverUrl`
  - Discovery: `erp.json` → returns OIDC issuer + API bases (and enabled modules)
  - OIDC login with PKCE against Keycloak
- Persist:
  - Refresh token in secure storage
  - Selected company context
  - Last-selected company per `serverUrl` (multi-company support + company switcher)
- Session expectations:
  - Short-lived access tokens
  - Robust refresh under intermittent connectivity; if refresh fails → re-login

## App shell & navigation (proposed; keep consistent)
- Top bar: company switcher + notifications badge.
- Bottom tabs: Home (Dashboard), Txns, Requests, Invoices/Documents, Settings.
- Global notifications center accessible from top bar.

## Core screens & behaviors (v1)
- Home/Dashboard:
  - Current month totals (income/expenses), cashflow trend, open invoices (count+total)
  - “Tax hints” as reminders, not legal authority
  - Income prediction (v1): simple extrapolation + recurring detection + “last updated”
  - Invoice completeness signal + “submit missing invoices” CTA (see below)
- Transactions:
  - Read-only initially; filters (All/In/Out), period picker, search; pagination; read-only totals
- Invoices/Documents:
  - Status lists (Pending/Approved/Rejected) + viewer; show “missing fields” state
  - Submission CTA via mailbox address (copy/share); “Upload document” is future
- Requests:
  - Templates (Balance sheet, Bank declarations, Profit/expense for credit loan (last 2 years or range), Custom guided)
  - Payload fields: type, optional date range, purpose, deadline, attachments, notes
  - Workflow: owner submits → office updates status → owner gets completion notification + downloadable artifacts
- Notifications:
  - Types (v1): bank txn in/out, invoice paid/overdue, missing documents reminder, accountant message (optional)
  - Deep-link every notification to a specific object (txn/invoice/request)
  - Coarse user prefs: enable/disable by type
  - Delivery: data plane emits events; core gateway pushes to APNs/FCM and/or data-plane notification service

## Offline & performance (must-have)
- Offline:
  - Cache last dashboard snapshot
  - Cache last 30–90 days transactions (configurable)
  - Queue service requests offline; submit when online
- Performance:
  - Minimize cold-start calls (discovery + token refresh in parallel where possible)
  - Pagination for list screens
  - Prefer push-based updates; keep mobile lightweight

## API contract (current doc surface; treat gaps as TODOs)
- Via core gateway:
  - `GET /api/modules`, `GET /api/companies`, `GET /api/dashboard?companyId=...`
  - `GET /api/transactions?companyId=...`, `GET /api/invoices?companyId=...`
  - `POST /api/service-requests`
- Auth: Bearer access token (OIDC).
- Company context: prefer header `X-Company-Id` (avoid sensitive query params).
- Errors: standard error envelope with request id; retry-safe POSTs via idempotency keys.

## Invoice completeness indicator (planned; v1 UX expectation)
- Show period-based view model: period, counts (bank expenses vs submitted invoices), delta, `limitations[]`, `mailbox_address`.
- Must include “indicator, not legal authority” wording.
- If bank ingestion disabled → hide/“enable bank sync”; if mailbox unavailable → fallback messaging (“contact accountant”; upload is future).
- Prefer server-side snapshots per period + cached responses; show “last updated”.

## Open questions to resolve early (from docs)
- Final tab layout (is Notifications a tab or top-bar-only?).
- Document submission in v1: mailbox-only vs upload.
- “No invoice expected” flags: owner-editable vs accountant-only.
- Mailbox address source: core config vs accounting module.
- Missing API surfaces: requests list/status endpoints, notifications inbox/backing store.

## Safety & quality
- Prefer small, well-scoped PR-sized changes.
- Keep platform-specific behavior behind clear abstractions and feature checks.
- Add/adjust tests when touching logic that can be unit-tested; keep UI snapshots minimal.
