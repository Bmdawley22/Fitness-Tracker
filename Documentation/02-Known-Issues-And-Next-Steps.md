# Known Issues and Next Steps

## Current Issues (Codebase Today)

1. Lint failure in auth screen

- File: `app/auth-entry.tsx`
- Issue: unescaped quote characters inside JSX text trigger `react/no-unescaped-entities`.
- Impact: `npm run lint` is currently failing.

2. Seed version naming mismatch

- File: `data/seededCatalog.ts`
- `FEDB_SEED_VERSION` is `fedb-v1-200`, but selection is explicitly `slice(0, 200)`.
- Impact: version label can confuse future migrations/releases.

3. Legacy/default docs still present

- `README.md` remains Expo boilerplate.
- `DEVELOPMENT.md` contains outdated structure and planned components that do not match current implementation.
- Impact: onboarding and maintenance friction.

4. Local-only auth model

- Passwords are stored in plaintext in AsyncStorage via Zustand persist.
- Impact: acceptable for prototype/local-only use, not production-grade auth/security.

## Risks to Watch

- Large single-screen files (`app/(tabs)/add.tsx`, `app/(tabs)/workouts.tsx`) combine many responsibilities.
- Increased change risk when modifying UI behavior because state, modals, and mutation logic are tightly coupled.

## Suggested Next Moves (Practical)

1. Fix lint blockers immediately

- Escape quotes in auth motivational copy or move text to a normal string variable.

2. Align seed metadata

- Either change slice to 201 or rename seed version to `fedb-v1-200`.

3. Replace root docs with product docs

- Update `README.md` to describe real app behavior, setup, and architecture links in `Documentation/`.

4. Split oversized tab files

- Start by extracting modal sections + helper hooks in:
  - `app/(tabs)/add.tsx`
  - `app/(tabs)/workouts.tsx`

5. Add smoke tests around stores

- Focus first on:
  - schedule assignment/remap/removal logic,
  - max-exercise constraints,
  - seed refresh behavior.

## Suggested Documentation Entry Points

- Project state: `Documentation/00-Project-State-Analysis.md`
- Architecture map: `Documentation/01-Component-Architecture.md`
- This file: `Documentation/02-Known-Issues-And-Next-Steps.md`
