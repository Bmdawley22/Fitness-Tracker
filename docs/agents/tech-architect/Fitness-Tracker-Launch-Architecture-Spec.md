# Fitness-Tracker Launch Architecture Spec

## 1) Objective
Launch Fitness-Tracker as a reliable, monetizable mobile product with a low-ops architecture that can scale from MVP to growth.

## 2) Target Architecture (v1)
- **Mobile App:** Expo React Native (EAS Build/Submit)
- **Backend Platform:** Supabase
  - Postgres (primary data store)
  - Auth (email + social providers as enabled)
  - Storage (exercise images, user assets)
  - Edge Functions (API/business logic)
- **Optional API Service (only when needed):** Railway or Render (Node.js)
- **Payments/Entitlements:** RevenueCat + App Store/Google Play IAP (Stripe for web flows if introduced)
- **Monitoring/Observability:** Sentry (crash/error), uptime checks
- **Product Analytics:** PostHog (or Firebase Analytics)

## 3) Core Data Domains
- `users`
- `exercises` (seeded + curated)
- `workouts`
- `workout_exercises`
- `plans/schedules`
- `activity_logs` (completed workouts, volume, adherence)
- `subscriptions/entitlements`

## 4) Exercise Seed Strategy (Option 1)
Source: `yuhonas/free-exercise-db`

### Ingestion contract (required fields)
- `name`
- `description`
- `instructions`
- `image`
- `equipment`
- `category`

### Rules
- Normalize all source rows to internal schema.
- Generate stable internal IDs (slug + hash strategy).
- Deduplicate by normalized `name + equipment + category`.
- Track `source`, `source_id`, `seed_version`, `imported_at`.
- On missing fields:
  - `description`: fallback to short generated/templated text or null
  - `image`: fallback placeholder image URL
  - `instructions`: require non-empty array; otherwise mark `needs_review`

## 5) Environment Model
- **dev:** local iteration + unstable schemas
- **staging:** production-like QA, beta validation
- **prod:** live users only

Each environment must have isolated:
- Supabase project
- API keys/secrets
- RevenueCat config/app identifiers
- Analytics projects/events

## 6) Security & Access Controls
- Enable Supabase Row Level Security (RLS) on user-owned tables.
- Principle of least privilege for service-role usage (Edge Functions only).
- Store secrets in env vars only (.env not committed).
- Rate-limit write-heavy endpoints (logs, sync, entitlement checks).
- Add basic abuse controls on auth + API routes.

## 7) Sync & Offline Behavior
- Local-first read for exercise catalog and saved workouts.
- Background sync on app open and periodic intervals.
- Conflict policy for user-edited objects: last-write-wins for MVP, with `updated_at` audit fields.
- Seed catalog must be available offline after first successful sync/import.

## 8) Payments & Entitlements
- RevenueCat is source of truth for mobile entitlement state.
- App Store/Play products mapped to entitlement tiers.
- Backend stores entitlement snapshot + timestamps for audit.
- Required test cases:
  - purchase success
  - restore purchases
  - cancellation/expiration handling
  - grace period and failed renewal behavior

## 9) Reliability & Operations
- SLO target by phase:
  - MVP: 99.0–99.5%
  - Paid launch: 99.5–99.9%
- Daily automated backups + monthly restore drill minimum.
- Uptime checks for API/DB auth-critical flows.
- Alert routing for:
  - API error spikes
  - crash-free session drops
  - payment webhook failures

## 10) Release Pipeline
- EAS build profiles: `preview`, `production`.
- CI checks (minimum): typecheck, lint, smoke tests.
- Beta distribution: TestFlight + Play Internal Testing.
- Store submission readiness:
  - privacy policy
  - support URL
  - subscription disclosures
  - screenshots and metadata

## 11) 8-Week Implementation Plan (Execution)
1. **Week 1:** Foundation (envs, Supabase, Sentry, analytics, EAS)
2. **Week 2:** Seed ingestion + normalization + RLS + read APIs
3. **Week 3:** Auth + persistence + sync/offline behavior
4. **Week 4:** RevenueCat + product config + entitlement flow
5. **Week 5:** Backups, alerting, rate limits, feature flags
6. **Week 6:** Beta QA matrix + performance pass + store assets
7. **Week 7:** Production launch + daily monitoring + hotfix readiness
8. **Week 8:** Funnel optimization + retention/paywall experiments

## 12) Cost Envelope (Monthly)
- **~100 MAU:** ~$0–$50
- **~1,000 MAU:** ~$55–$276
- **~10,000 MAU:** ~$430–$2,250
- Additional fixed costs: Apple Developer $99/year, Google Play $25 one-time

## 13) Acceptance Criteria (Definition of Done)
- Seeded exercise catalog is live using required metadata fields.
- Users can browse/select seeded exercises in workout creation flows.
- Auth, sync, and local persistence operate reliably across app restarts.
- Subscription purchase/restore/cancel flows verified end-to-end.
- Crash monitoring + uptime alerting + backups are active.
- App is deployable via EAS and submission-ready for both stores.

## 14) Immediate Next Actions
1. Approve this architecture baseline.
2. Open implementation tickets for Weeks 1–2.
3. Start seed ingestion pipeline + schema migration in staging.
4. Define premium entitlement matrix before Week 4 integration.
