# Context-Aware Dashboard - Step 1 Implementation

## Overview

Step 1: Context-Aware Dashboard Foundation - core context detection and adaptive layout system that detects user state and selectively renders widgets based on time-of-day and workout patterns.

## Features Implemented

✅ Time slot detection (morning/midday/evening/night)  
✅ Pattern analysis (last workout timestamp, streak days)  
✅ Adaptive layout engine (selects and renders 3 widget types)  
✅ Widget implementations:
  - StreakBadgeWidget (display active streak)
  - SuggestedWorkoutWidget (resume last routine)
  - QuickLogWidget (1-tap workout log)  
✅ Widget entrance animations (FadeInDown with 200ms stagger)

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
│   └── AdaptiveLayoutEngine.ts      # Widget selection logic
├── hooks/
│   └── useDashboardContext.ts       # Context resolution hook
├── types/
│   └── DashboardContext.ts          # TypeScript types
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

## Excluded from Step 1

❌ Telemetry/analytics  
❌ Quick actions bar  
❌ RecoveryWidget, other widget types  
❌ Background pattern refresh  
❌ Caching/persistence of computed context  
❌ Layout transition animations (reflow on context change)

## Next Steps

Step 2 will add:
- Telemetry scaffolding
- Quick actions bar
- Additional widget types (RecoveryWidget, etc.)
- Background refresh
- Context caching
