// ContextEngine.ts - Resolve dashboard context from user workout history

import { detectTimeSlot } from '../utils/timeSlotDetector';
import { calculateStreakAndRecency } from '../utils/streakCalculator';
import type { DashboardContext } from '../types/DashboardContext';

type WorkoutRecord = {
  timestamp: number;
};

/**
 * Context Engine - Detects time slot and user workout patterns.
 * Queries last 30 days of workouts from DB and calculates:
 * - lastWorkoutTs
 * - streakDays (consecutive days with ≥1 workout)
 * - daysSinceLastWorkout
 */
export class ContextEngine {
  /**
   * Resolve current dashboard context.
   * @param getRecentWorkouts - Async function to fetch recent workouts from DB
   */
  static async resolve(
    getRecentWorkouts: (daysBack: number) => Promise<WorkoutRecord[]>
  ): Promise<DashboardContext> {
    // Detect current time slot
    const timeSlot = detectTimeSlot();

    // Fetch last 30 days of workouts
    const workouts = await getRecentWorkouts(30);

    // Calculate user patterns
    const patterns = calculateStreakAndRecency(workouts);

    return {
      timeSlot,
      patterns,
    };
  }
}
