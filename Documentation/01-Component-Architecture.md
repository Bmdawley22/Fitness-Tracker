# Component Architecture Map

## 1) App Shell and Navigation
- `app/_layout.tsx`
  - Wraps app in React Navigation `ThemeProvider`.
  - Uses `useAuthStore(state => state.isSignedIn)` to gate between:
    - `auth-entry` (signed out)
    - `(tabs)` (signed in)
  - Registers `modal` route.

- `app/(tabs)/_layout.tsx`
  - Defines 4-tab bottom nav:
    - `index` -> Home
    - `workouts` -> Saved
    - `search` -> Schedule
    - `add` -> Today
  - Uses `HapticTab` for iOS press feedback.

## 2) Auth Component
- `app/auth-entry.tsx`
  - Modes: `entry`, `login`, `signup`.
  - Validates signup fields (email format, username pattern, password complexity).
  - Uses auth store APIs:
    - `createLocalAccount(...)`
    - `loginWithCredentials(...)`
    - `consumePostSignupMessage()`
  - Redirects signed-in users to `/(tabs)`.

## 3) Home Component
- `app/(tabs)/index.tsx`
  - Main browsing/entry screen for workouts and exercises.
  - Pulls data from:
    - `useSavedWorkoutsStore` (saved/custom exercises and workouts)
    - `useExerciseCatalogStore` (seeded catalog)
  - Includes:
    - exercise muscle-group filtering,
    - search,
    - exercise detail modal,
    - quick-create modal,
    - add-to-saved / add-to-workout flows,
    - logout confirmation.
  - Invokes `CreateFlowModals` from `add.tsx` for create-workout/exercise flows.

## 4) Saved Component
- `app/(tabs)/workouts.tsx`
  - Management surface for saved workouts and saved exercises.
  - Features:
    - filter switch (workouts/exercises),
    - edit modes and bulk removal,
    - per-row swipe-to-delete behavior,
    - workout detail and workout edit flow,
    - exercise detail with add-to-workout and remove actions.
  - Uses store APIs for mutation-heavy operations:
    - `removeWorkout`, `updateWorkout`, `updateAndRegenerateId`,
    - `removeExerciseFromWorkout`, `addExerciseToWorkout`, `removeExercise`.

## 5) Schedule Component
- `app/(tabs)/search.tsx`
  - Weekly planner with previous/next week controls.
  - Per-day workout assignment with editable day modal.
  - Completion state styling and display.
  - Calendar modal to jump to week by date.
  - Workout detail modal for assigned workout.
  - Cleanup hook calls `cleanupInvalidAssignments(...)` after hydration.

## 6) Today Component
- `app/(tabs)/add.tsx`
  - Two major responsibilities:
    - reusable `CreateFlowModals` component for creating workouts/exercises,
    - Today execution screen for assigned workout.
  - Today flow features:
    - assign/clear today workout,
    - per-exercise checkbox state,
    - set/rep/weight logging per exercise,
    - mark day complete.
  - Log entries are persisted via `useScheduleStore.setExerciseLog(...)`.

## 7) Data/State Components
- `store/auth.ts`
  - Local persisted account/authentication state.
  - No external identity provider integration.

- `store/exerciseCatalog.ts`
  - Seeded catalog hydration + versioned refresh interface.

- `store/savedWorkouts.ts`
  - Persisted user workout/exercise state.
  - Enforces max 12 exercises per workout.

- `store/schedule.ts`
  - Persisted schedule/completion/log state keyed by local date (`YYYY-MM-DD`).
  - Includes migration and normalization for persisted logs.

- `data/seededCatalog.ts`
  - Pure transform layer from vendored JSON -> app exercise shape.
  - Normalizes text/muscles/equipment/image URL.
  - Generates deterministic seeded IDs.

## 8) Shared UI Components
- Actively used:
  - `components/haptic-tab.tsx`
  - `components/ui/icon-symbol.tsx` and `.ios.tsx`

- Present from template / lightly used:
  - `components/themed-text.tsx`, `components/themed-view.tsx`,
  - `components/parallax-scroll-view.tsx`, `components/external-link.tsx`, etc.

## 9) Key Interaction Boundaries
- Auth boundary: `RootLayout` decides access to tabs.
- Catalog boundary: all tab screens rely on `runSeedIfNeeded()` after catalog hydration.
- Schedule boundary: `Schedule` assigns workouts; `Today` executes/logs assigned workout for the current date.
- Mutation boundary: `Saved` screen performs most destructive editing operations.
