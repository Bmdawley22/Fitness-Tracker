# Context-Aware Dashboard - Step 1 Implementation

## Overview

Step 1: Context-Aware Dashboard Foundation - core context detection and adaptive layout system that detects user state and selectively renders widgets based on time-of-day and workout patterns.

## Features Implemented

### Step 1: Foundation
✅ Time slot detection (morning/midday/evening/night)  
✅ Pattern analysis (last workout timestamp, streak days)  
✅ Adaptive layout engine (selects and renders 3 widget types)  
✅ Widget implementations:
  - StreakBadgeWidget (display active streak)
  - SuggestedWorkoutWidget (resume last routine)
  - QuickLogWidget (1-tap workout log)  
✅ Widget entrance animations (FadeInDown with 200ms stagger)

### Step 2: Telemetry & Event Tracking
✅ TelemetryCollector service with event buffering (auto-flush at 10 events)  
✅ useTelemetry hook for easy event capture  
✅ Event tracking for all dashboard interactions:
  - `hero_dashboard_view` (on mount)
  - `widget_rendered` (for each widget with position)
  - `quick_action_tap` (QuickLogWidget tap)
  - `suggestion_accepted` (SuggestedWorkoutWidget CTA tap)  
✅ Context capture at event time (timeSlot, userState, streak, etc.)  
✅ Local console logging of event batches  
✅ User state derivation (active_streak, recent_activity, onboarding, inactive)

## Integration Example

```typescript
import { HeroDashboard } from '@/src/features/dashboard/components/HeroDashboard';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';

function HomeScreen() {
  const { savedWorkouts } = useSavedWorkoutsStore();

  // Convert saved workouts to workout records for dashboard
  const getRecentWorkouts = async (daysBack: number) => {
    const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
    return savedWorkouts
      .filter(workout => workout.createdAt >= cutoff)
      .map(workout => ({ timestamp: workout.createdAt }));
  };

  const hasWorkoutHistory = savedWorkouts.length > 0;
  const mostRecentWorkout = savedWorkouts.sort((a, b) => b.createdAt - a.createdAt)[0];

  return (
    <View>
      <HeroDashboard
        getRecentWorkouts={getRecentWorkouts}
        hasWorkoutHistory={hasWorkoutHistory}
        mostRecentRoutineName={mostRecentWorkout?.name}
        onStartWorkout={() => {
          // Navigate to workout flow screen with routine pre-loaded
          router.push('/flow');
        }}
        onLogWorkout={() => {
          // Navigate to workout log screen
          router.push('/add');
        }}
      />
    </View>
  );
}
```

## File Structure

```
src/features/dashboard/
├── components/
│   ├── HeroDashboard.tsx           # Main dashboard component
│   └── widgets/
│       ├── StreakBadgeWidget.tsx    # 🔥 Streak display
│       ├── SuggestedWorkoutWidget.tsx # Resume workout
│       └── QuickLogWidget.tsx       # Quick log button
├── services/
│   ├── ContextEngine.ts             # Time + pattern detection
│   ├── AdaptiveLayoutEngine.ts      # Widget selection logic
│   └── TelemetryCollector.ts        # Event buffering + batch logging
├── hooks/
│   ├── useDashboardContext.ts       # Context resolution hook
│   └── useTelemetry.ts              # Event tracking hook
├── types/
│   ├── DashboardContext.ts          # Context types
│   └── TelemetryEvent.ts            # Event schema types
└── utils/
    ├── timeSlotDetector.ts          # Time slot detection
    └── streakCalculator.ts          # Streak calculation
```

## Context Detection Logic

**Time Slots:**
- morning: 5am-11am
- midday: 11am-5pm
- evening: 5pm-10pm
- night: 10pm-5am

**Pattern Analysis:**
- Queries last 30 days of workouts
- Calculates: `lastWorkoutTs`, `streakDays`, `daysSinceLastWorkout`

## Adaptive Layout Rules

1. If `streakDays >= 3` AND `daysSinceLastWorkout === 0`:  
   → Show **StreakBadgeWidget** (variant: 'active')

2. If `timeSlot === 'morning'` AND user has workout history:  
   → Show **SuggestedWorkoutWidget**

3. Always include: **QuickLogWidget**

**Widget priority order:** StreakBadge (top) → SuggestedWorkout → QuickLog (bottom)

## Animation

- Entrance: FadeInDown (react-native-reanimated)
- Stagger: 200ms between widgets
- Duration: 450ms per widget

## Excluded from Step 2

❌ API endpoint for telemetry upload (events logged to console only)  
❌ Background telemetry flush (manual flush on 10-event threshold)  
❌ Offline event persistence (AsyncStorage buffering)  
❌ A/B test tracking  
❌ Conversion funnel analytics  
❌ Quick actions bar  
❌ RecoveryWidget, other widget types  
❌ Background pattern refresh  
❌ Caching/persistence of computed context  
❌ Layout transition animations (reflow on context change)

## Next Steps

Step 3 will add:
- API endpoint for telemetry upload
- Background telemetry flush
- Offline event persistence
- Quick actions bar
- Additional widget types (RecoveryWidget, etc.)
- Background refresh
- Context caching

## Phase 2 Step 1 (Context Engine Foundation)

Added contextual foundation primitives for downstream hero/dashboard systems:
- `buildHeroContext(options)` in `services/ContextEngine.ts`
- `HeroDashboardContext` and related types in `types/DashboardContext.ts`
- `useContextEngine()` hook in `hooks/useContextEngine.ts`
- Context validation tests in `services/ContextEngine.test.ts`

This layer computes period bucket, rest-day flag, streak status, last-workout fallback, and routine-signal summary with safe defaults for missing data.

## Phase 2 Step 4 (Quick actions & navigable telemetry)

- `services/QuickActionRouter.ts` resolves deterministic primary/secondary hero actions from `HeroDashboardContext`.
- `hooks/useHeroQuickActions.ts` wires those actions to telemetry (`hero_cta_click`) and navigation/callback handlers.
- `HeroDashboard.tsx` now consumes hook-driven labels/handlers so CTA routing and analytics are centralized.
- Added `QuickActionRouter.test.ts` coverage for rest-day/routine/no-routine action selection.
