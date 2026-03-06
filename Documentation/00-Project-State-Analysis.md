# Fitness Tracker - Project State Analysis (March 6, 2026)

## Snapshot

- Stack: Expo + React Native + TypeScript + Expo Router + Zustand + AsyncStorage.
- Routing model: file-based (`app/`) with auth gate at root layout.
- Data model: seeded exercise catalog + user-created exercises/workouts + date schedule + per-exercise set logs.
- Persistence: all major state stores are persisted locally via AsyncStorage.

## Current App Structure (Implemented)

- `app/_layout.tsx`: root stack and auth gating.
- `app/auth-entry.tsx`: local signup/login experience with client-side validation.
- `app/(tabs)/_layout.tsx`: 4-tab navigation (`Home`, `Saved`, `Schedule`, `Today`).
- `app/(tabs)/index.tsx` (`Home`): browse exercises/workouts, quick-create entry points, add to saved/workouts.
- `app/(tabs)/workouts.tsx` (`Saved`): manage saved workouts/exercises, swipe delete, bulk delete, workout editing.
- `app/(tabs)/search.tsx` (`Schedule`): weekly planner + day assignment + calendar modal.
- `app/(tabs)/add.tsx` (`Today`): today workout execution, set/rep/weight logging, completion tracking.

## State Stores (Implemented)

- `store/auth.ts`
  - Local account store (username/email/password), login/logout state, hydration flag.
- `store/exerciseCatalog.ts`
  - Seeded exercise catalog state/version and seed refresh hooks.
- `store/savedWorkouts.ts`
  - Saved workouts, saved exercises, custom exercises, edit/remove/reorder/add APIs.
- `store/schedule.ts`
  - Date -> workout assignment, completion state, workout exercise logs by date.
- `store/uiState.ts`
  - Small cross-screen UI handoff state (currently narrow usage).

## Seeded Catalog State

- Source file: `vendor/free-exercise-db/exercises.json`.
- Raw vendor exercise count in repo: **873** entries.
- App seeding pipeline (`data/seededCatalog.ts`) currently:
  - normalizes records,
  - computes stable IDs with `seed-fedb-` prefix,
  - sorts deterministically,
  - slices to first **200** records.
- Current seed version constant: `fedb-v1-200`.

## Persistence + Data Lifecycles

- All primary stores use Zustand `persist` + `createJSONStorage(AsyncStorage)`.
- Hydration guards are present in auth/catalog/schedule/saved stores.
- Schedule store includes migration/sanitization logic for persisted date keys and exercise logs.
- Schedule cleanup/remap integration exists when workout IDs change or workouts are removed.

## Quality and Repo Status

- Git status at analysis time:
  - Modified: `.vscode/settings.json` (pre-existing change).
- Lint run (`npm run lint`) result:
  - **Failing** with 2 `react/no-unescaped-entities` errors in `app/auth-entry.tsx` line 179.
  - Error is from quoted motivational text string rendered in JSX.

## Documentation Drift Found

- `README.md` is still the default Expo template and does not describe current product behavior.
- `DEVELOPMENT.md` includes sections that no longer match current structure (legacy/planned items from earlier phases).

## Overall Assessment

- Core product loop is implemented: auth -> create/save workouts/exercises -> schedule -> execute/log today.
- State architecture is coherent and fully local-first.
- Main current-state gap is documentation alignment + small lint hygiene issue.
