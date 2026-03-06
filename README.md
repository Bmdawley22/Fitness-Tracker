# Fitness Tracker

A local-first fitness app built with Expo Router + React Native.

## What It Does
- Local account signup/login.
- Browse seeded exercises plus custom exercises.
- Create and save workouts (up to 12 exercises per workout).
- Schedule workouts by day in a weekly planner.
- Track today's assigned workout.
- Log sets (reps + weight) per exercise for each date.
- Mark scheduled days complete.

## Tech Stack
- Expo / React Native / TypeScript
- Expo Router (file-based navigation)
- Zustand + AsyncStorage (persisted local state)

## App Navigation
- `Home` (`app/(tabs)/index.tsx`): browse exercises/workouts and quick-create flows.
- `Saved` (`app/(tabs)/workouts.tsx`): manage saved workouts/exercises.
- `Schedule` (`app/(tabs)/search.tsx`): assign workouts to dates.
- `Today` (`app/(tabs)/add.tsx`): run today's workout and log sets.

## Data Model (High-Level)
- Seeded catalog: `store/exerciseCatalog.ts` + `data/seededCatalog.ts`
- User library: `store/savedWorkouts.ts`
- Schedule + completion + logs: `store/schedule.ts`
- Auth/session: `store/auth.ts`

## Development
1. Install dependencies
```bash
npm install
```

2. Start Expo
```bash
npm start
```

3. Platform targets
```bash
npm run ios
npm run android
npm run web
```

4. Lint
```bash
npm run lint
```

## Documentation
See the `Documentation/` folder:
- `Documentation/00-Project-State-Analysis.md`
- `Documentation/01-Component-Architecture.md`
- `Documentation/02-Known-Issues-And-Next-Steps.md`
- `Documentation/README.md`