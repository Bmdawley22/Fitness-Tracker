export type PeriodBucket = 'morning' | 'day' | 'evening' | 'night';
export type StreakStatus = 'healthy' | 'atRisk' | 'broken';

export type RoutineSignal = {
  workoutId: string;
  workoutName: string;
  assignmentCount: number;
  totalDurationMinutes: number;
};

export type HeroDashboardContext = {
  period: PeriodBucket;
  isRestDay: boolean;
  streakStatus: StreakStatus;
  lastWorkoutAt: string | null;
  routineSignal: RoutineSignal | null;
};

export const HERO_CONTEXT_THRESHOLDS = {
  healthyStreakDays: 5,
  atRiskStreakDaysMin: 3,
  lookbackDays: 7,
} as const;

// Backward-compatible aliases used by the current adaptive layout + telemetry scaffolding.
export type TimeSlot = 'morning' | 'midday' | 'evening' | 'night';

export type UserPatterns = {
  lastWorkoutTs: number | null;
  streakDays: number;
  daysSinceLastWorkout: number;
};

export type DashboardContext = {
  timeSlot: TimeSlot;
  patterns: UserPatterns;
};

export type WidgetType = 'streak' | 'suggested' | 'quickLog';

export type WidgetLayout = {
  widgets: WidgetType[];
};
