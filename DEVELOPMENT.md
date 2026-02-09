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

---

**Brady:** The app is now set up and ready. Files are in `/home/openclaw/.openclaw/workspace/fitness-tracker/`.

Next: I'll create the core screens and start the health data integration.
