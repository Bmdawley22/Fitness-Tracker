// streakCalculator.ts - Calculate workout streak from workout history

import type { UserPatterns } from '../types/DashboardContext';

type WorkoutRecord = {
  timestamp: number;
};

/**
 * Calculate streak days and days since last workout from workout history.
 * Streak = consecutive days with ≥1 workout.
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
  const msPerDay = 24 * 60 * 60 * 1000;

  const daysSinceLastWorkout = Math.floor((now - lastWorkoutTs) / msPerDay);

  // Group workouts by day
  const workoutsByDay = new Map<string, number>();
  sorted.forEach(workout => {
    const date = new Date(workout.timestamp);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    workoutsByDay.set(dayKey, workout.timestamp);
  });

  // Calculate streak (consecutive days)
  let streakDays = 0;
  const todayKey = new Date(now).toISOString().split('T')[0];
  let checkDate = new Date(now);

  // Start from today (or yesterday if no workout today)
  if (!workoutsByDay.has(todayKey)) {
    checkDate = new Date(now - msPerDay);
  }

  while (true) {
    const dayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
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
