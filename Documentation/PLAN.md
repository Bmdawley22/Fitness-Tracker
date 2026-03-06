## Step 4 Plan: Split Oversized Tab Screens Into Hooks + Modal Components

### Summary
Refactor the two largest screens into composable units using a **two-pass rollout** and **hooks + modal components** as the default pattern.

- Pass 1: `app/(tabs)/add.tsx` (Today screen + create flows)
- Pass 2: `app/(tabs)/workouts.tsx` (Saved screen + edit/delete flows)

Primary goal: reduce file complexity and change risk without changing product behavior or store contracts.

### Implementation Changes

#### Pass 1: Refactor `add.tsx`
- Extract shared create-flow UI/logic (`CreateFlowModals`) into a dedicated reusable component module.
- Split Today screen into:
  - `useTodayWorkoutScreen` hook (state + handlers + derived values)
  - `TodayWorkoutCard` presentational component (main Today view)
  - `WorkoutAssignmentModal` component
  - `ExerciseLogModal` component (sets/picker/remove-set subviews)
- Move set/rep/weight constants and helpers into a small local module used by the hook/components.
- Keep `app/(tabs)/add.tsx` as orchestration only: wires hook outputs into presentational components/modals.
- Target outcome: no behavioral changes; large local state clusters leave the route file.

#### Pass 2: Refactor `workouts.tsx`
- Extract swipe row to standalone component with same gesture behavior and props.
- Split Saved screen into:
  - `useSavedScreen` hook (filters, edit mode, bulk/remove flows, selection state)
  - `SavedListSection` component (workouts/exercises list rendering)
  - Modal components for:
    - workout detail
    - exercise detail
    - menu/action sheets
    - workout edit
    - add-exercise-to-workout selection
    - exercise selection for edit flow
    - bulk/swipe confirm dialogs
    - logout confirm
- Keep route file as composition layer only (tab-level shell + top-level modal visibility wiring).
- Preserve all existing store interactions and side effects (`savedWorkouts`, `exerciseCatalog`, `auth`).

#### Refactor Constraints (both passes)
- No changes to persisted store schemas or storage keys.
- No route/path changes.
- No functional UI changes beyond internal component boundaries.
- No new dependencies.

### Public Interfaces / Types
- No public API changes to Zustand stores.
- Add internal component prop contracts and hook return types to lock behavior:
  - explicit `Props` types for each extracted modal/presentational component
  - explicit hook return type objects (avoid implicit `any`/shape drift)
- Keep existing exported symbols used cross-screen (notably create-flow exports) backward-compatible during extraction.

### Test Plan
Run after each pass:
1. `npm run lint`
2. Manual smoke checks:
   - Auth -> enter tabs still works
   - Home create flow still opens and saves workouts/exercises
   - Today:
     - assign/clear workout
     - toggle exercise completion
     - open exercise log, edit sets/reps/weight, save persists
     - complete/uncomplete day behavior
   - Saved:
     - filter workouts/exercises
     - swipe delete + confirm/cancel
     - bulk remove flow
     - edit workout name/description and exercise list
     - add saved exercise to existing workout
   - Schedule:
     - assignments still render correctly after workout edits/removals
3. Regression checks:
   - hydration-gated screens still load correctly after app restart
   - no duplicate saves introduced
   - workout max-exercise limit still enforced

### Assumptions and Defaults
- Chosen rollout: **Two passes**.
- Chosen extraction style: **Hooks + modal components**.
- Success criterion for step 4: both route files are reduced to orchestration-focused shells, behavior remains unchanged, lint passes, and all listed smoke checks pass.
