# Fitness Tracker App - Development Guide

## Project Structure

```
fitness-tracker/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── _layout.tsx    # Tab navigator
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── workout.tsx    # Workout tracking
│   │   └── stats.tsx      # Statistics & charts
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screens
├── components/             # Reusable UI components
│   ├── WorkoutCard.tsx
│   ├── StatsChart.tsx
│   ├── WorkoutForm.tsx
│   └── ui/
├── hooks/                  # Custom React hooks
│   ├── useWorkouts.ts     # Workout state management
│   ├── useHealthKit.ts    # HealthKit integration
│   └── useSensors.ts      # Accelerometer/pedometer
├── constants/              # App constants
├── lib/                    # Utilities
│   ├── storage.ts         # AsyncStorage helpers
│   ├── calculations.ts    # Fitness math (calories, etc)
│   └── health-api.ts      # HealthKit/Google Fit
├── types/                  # TypeScript types
│   └── workout.ts
├── assets/                 # Icons, images, splash
├── app.json               # Expo config
└── package.json
```

## Getting Started

### 1. Install Dependencies
```bash
cd fitness-tracker
npm install
# or
yarn install
```

### 2. Run Development Server
```bash
npm start
```

Then:
- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`
- **Web:** Press `w`
- **Expo Go (phone):** Scan QR code with Expo Go app

### 3. Run on Device
```bash
# iOS (requires macOS + Xcode)
npm run ios

# Android
npm run android

# Web (testing)
npm run web
```

## Core Features

### 1. **Workout Tracking**
- Start/stop workouts
- Log exercises (type, duration, intensity)
- Real-time step counting (pedometer)
- Heart rate (if available)
- Store workouts locally & sync to cloud

### 2. **Health Data Integration**
- **iOS:** Apple HealthKit
- **Android:** Google Fit API
- Read/write step count, calories burned, heart rate

### 3. **Statistics & Charts**
- Daily/weekly/monthly summaries
- Progress charts (calories, steps, duration)
- Streaks & goals
- Export data

### 4. **Authentication**
- Biometric login (Face ID / Touch ID / Fingerprint)
- User profile
- Data privacy

## Dependencies Installed

### Core
- `expo` — Framework
- `react-native` — Mobile framework
- `expo-router` — File-based routing

### Fitness Features
- `expo-sensors` — Pedometer, accelerometer
- `expo-health` — HealthKit (iOS) / Google Fit (Android)
- `victory-native` — Charts & graphs
- `react-native-svg-charts` — Advanced charts

### State Management
- `zustand` — Lightweight state (alternative to Redux)
- `@react-native-async-storage/async-storage` — Local storage

### Utilities
- `date-fns` — Date manipulation
- `uuid` — Unique IDs
- `react-native-svg` — SVG rendering

## Next Steps

1. **Design Home Screen**
   - Current stats display
   - Quick start workout button
   - Recent activity

2. **Build Workout Screen**
   - Form to log workout
   - Real-time sensor data display
   - Save functionality

3. **Create Stats Dashboard**
   - Charts for progress
   - Weekly/monthly summaries
   - Goals tracking

4. **HealthKit Integration**
   - Request permissions
   - Sync with Apple Health / Google Fit
   - Read historical data

5. **App Store Deployment**
   - Build APK/IPA
   - Submit to Apple App Store & Google Play
   - Use EAS (Expo Application Services)

## Build & Deploy

### Development Build
```bash
eas build --platform ios --build-type development
eas build --platform android --build-type development
```

### Production Build
```bash
eas build --platform ios
eas build --platform android
```

### Submit to App Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## Useful Commands

```bash
# Clear cache
npm start -- --clear

# Reset project to template
npm run reset-project

# Lint code
npm run lint

# Update dependencies
npm outdated
npm update
```

## Debugging

### React Native Debugger
- Install: https://github.com/jhen0409/react-native-debugger
- Open dev menu: `Cmd+D` (iOS) or `Cmd+M` (Android)

### Console Logs
- View in terminal where you ran `npm start`

### Error Messages
- Check `/android` or `/ios` folders for native errors

## Worklet version sync
- The project ships a `postinstall` script that runs `react-native-reanimated postinstall` so every `npm install` re-synchronizes the JS worklets version with the native runtime.
- After you bump `moti`, `react-native-reanimated`, or any dependency that bundles Reanimated worklets, delete `node_modules`, re-run `npm install`, and follow up with `npx react-native-reanimated postinstall` to regenerate the native bindings.
- Rebuild the native platforms afterwards (`cd ios && pod install` after removing `Pods/Podfile.lock` if necessary; Android `./gradlew clean && ./gradlew --refresh-dependencies`) so the pods/Gradle cache get the new worklet binary.
- Clear Metro cache (`npm start -- --reset-cache`) before running the app again to avoid stale worklet metadata.
- This sequence prevents the JavaScript/native mismatch crash when opening the hero dashboard flow CTA.

## Resources

- **Expo Docs:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev
- **Expo Health:** https://docs.expo.dev/versions/latest/sdk/health
- **Apple HealthKit:** https://developer.apple.com/healthkit
- **Google Fit:** https://developers.google.com/fit

## Environment Setup (Optional)

For native iOS builds:
```bash
npx pod-install
```

For Android:
```bash
# Ensure Java 17+ and Android SDK 35+ installed
# Then run
npm run android
```

## Migration Notes

### Seeded Exercise Catalog (fedb-v1-200)

**Date:** 2026-02-12

The app has been migrated from hardcoded built-in exercises and workouts to a deterministic, versioned seeded exercise catalog from the `free-exercise-db` project (https://github.com/yuhonas/free-exercise-db).

#### What Changed

1. **Removed Legacy Data**
   - Deleted `data/exercises.ts` (120+ hardcoded exercises)
   - Deleted `data/workouts.ts` (3 hardcoded workouts)
   - These were replaced by a seeded catalog of ~200 exercises

2. **New Seeded Catalog Store**
   - `store/exerciseCatalog.ts` — Persisted via Zustand + AsyncStorage
   - Deterministic seeding on first app launch (or version bump)
   - Stable exercise IDs: `seed-fedb-<stableKey>` to avoid collisions

3. **Catalog Data Source**
   - Vendor snapshot: `vendor/free-exercise-db/exercises.json`
   - No runtime network fetch; all data is pre-vendored
   - Normalization applied: name (required), description, instructions, primaryMuscles, secondaryMuscles, equipment, category

4. **Muscle-Based Grouping**
   - Replaced category-based UI filtering with `primaryMuscles` arrays
   - Home/Add/Workouts screens now group exercises by muscle groups dynamically
   - Custom exercises still support a primary category field for compatibility

5. **User Data Preserved**
   - Custom exercises and saved workouts are unaffected by seeding
   - On version bump, only seeded records are updated; user data remains intact

#### File Changes

**Created:**
- `data/seededCatalog.ts` — Catalog transform & deterministic selection logic
- `store/exerciseCatalog.ts` — Persisted seeded exercise store

**Updated:**
- `app/(tabs)/index.tsx` — Home screen: uses seeded store, muscle-group filtering
- `app/(tabs)/add.tsx` — Create flows: integrates seeded exercises
- `app/(tabs)/workouts.tsx` — Saved workouts: uses seeded exercise lookup
- `app/(tabs)/search.tsx` — Schedule: uses seeded exercises
- `store/savedWorkouts.ts` — Extended SavedExercise/CustomExercise types with muscle arrays

**Removed:**
- `data/exercises.ts`
- `data/workouts.ts`

#### Seed Versioning & Refresh

- **Version String:** `fedb-v1-200` (format: `fedb-v<major>-<count>`)
- **Refresh Behavior:** On app update with new version, seeded catalog recomputes and replaces via upsert-by-id + hard-remove logic
- **To Bump Version:** Update `FEDB_SEED_VERSION` in `data/seededCatalog.ts`, re-run deterministic selection

#### Testing Checklist

- [x] Fresh install: ~200 exercises seeded once
- [x] Restart: no duplicates, version persisted
- [x] Custom exercise creation: still works, survives refresh
- [x] Exercise/workout creation flows: seeded items selectable
- [x] Category-based UI replaced with muscle group logic
- [x] Lint/typecheck passes

---

**Brady:** The app is now set up and ready. Files are in `/home/openclaw/.openclaw/workspace/fitness-tracker/`.

Next: I'll create the core screens and start the health data integration.
