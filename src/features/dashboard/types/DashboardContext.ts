// DashboardContext.ts - Types for dashboard context and adaptive layout

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
