// streakCalculator.ts - Calculate workout streak from workout history

import type { UserPatterns } from '../types/DashboardContext';

type WorkoutRecord = {
  timestamp: number;
};

/**
 * Format date as YYYY-MM-DD day key using local time.
 */
function formatDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Calculate streak days and days since last workout from workout history.
 * Streak = consecutive calendar days with ≥1 workout.
 */
export function calculateStreakAndRecency(workouts: WorkoutRecord[]): UserPatterns {
  if (workouts.length === 0) {
    return {
      lastWorkoutTs: null,
      streakDays: 0,
      daysSinceLastWorkout: Infinity,
    };
  }

  // Sort workouts by timestamp (most recent first)
  const sorted = [...workouts].sort((a, b) => b.timestamp - a.timestamp);

  const lastWorkoutTs = sorted[0].timestamp;
  const now = Date.now();

  // Calculate calendar days since last workout (not 24-hour periods)
  const nowDate = new Date(now);
  const lastWorkoutDate = new Date(lastWorkoutTs);
  const nowDayKey = formatDayKey(nowDate);
  const lastWorkoutDayKey = formatDayKey(lastWorkoutDate);

  let daysSinceLastWorkout = 0;
  if (nowDayKey !== lastWorkoutDayKey) {
    const nowDayStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
    const lastWorkoutDayStart = new Date(lastWorkoutDate.getFullYear(), lastWorkoutDate.getMonth(), lastWorkoutDate.getDate()).getTime();
    daysSinceLastWorkout = Math.floor((nowDayStart - lastWorkoutDayStart) / (24 * 60 * 60 * 1000));
  }

  // Group workouts by calendar day (local time)
  const workoutsByDay = new Map<string, number>();
  sorted.forEach(workout => {
    const dayKey = formatDayKey(new Date(workout.timestamp));
    workoutsByDay.set(dayKey, workout.timestamp);
  });

  // Calculate streak (consecutive calendar days)
  let streakDays = 0;
  const todayKey = formatDayKey(new Date(now));
  const msPerDay = 24 * 60 * 60 * 1000;
  let checkDate = new Date(now);

  // Start from today (or yesterday if no workout today)
  if (!workoutsByDay.has(todayKey)) {
    checkDate = new Date(now - msPerDay);
  }

  while (true) {
    const dayKey = formatDayKey(checkDate);
    
    if (workoutsByDay.has(dayKey)) {
      streakDays++;
      checkDate = new Date(checkDate.getTime() - msPerDay);
    } else {
      break;
    }
  }

  return {
    lastWorkoutTs,
    streakDays,
    daysSinceLastWorkout,
  };
}
