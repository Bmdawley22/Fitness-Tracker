import { detectTimeSlot } from '../utils/timeSlotDetector';
import { calculateStreakAndRecency } from '../utils/streakCalculator';
import type { SavedWorkout } from '@/store/savedWorkouts';
import type { CompletionState, ScheduleState, WorkoutLogsByDateState } from '@/store/schedule';
import type { DashboardContext, HeroDashboardContext, PeriodBucket, RoutineSignal, StreakStatus } from '../types/DashboardContext';

type BuildHeroContextOptions = {
  schedule?: ScheduleState;
  completedDates?: CompletionState;
  workoutLogsByDate?: WorkoutLogsByDateState;
  savedWorkouts?: SavedWorkout[];
  now?: Date;
};

type WorkoutRecord = { timestamp: number };

const PERIOD_BOUNDARIES = {
  morningStart: 5,
  dayStart: 11,
  eveningStart: 17,
  nightStart: 22,
};

const parseDateKey = (dateKey: string): Date | null => {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateKey);
  if (!match) return null;
  const [, y, m, d] = match;
  const parsed = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const detectPeriod = (now: Date): PeriodBucket => {
  const hour = now.getHours();
  if (hour >= PERIOD_BOUNDARIES.morningStart && hour < PERIOD_BOUNDARIES.dayStart) return 'morning';
  if (hour >= PERIOD_BOUNDARIES.dayStart && hour < PERIOD_BOUNDARIES.eveningStart) return 'day';
  if (hour >= PERIOD_BOUNDARIES.eveningStart && hour < PERIOD_BOUNDARIES.nightStart) return 'evening';
  return 'night';
};

const computeConsecutiveCompletions = (completedDates: CompletionState, now: Date): number => {
  let consecutive = 0;
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    if (completedDates[toLocalDateKey(day)]) {
      consecutive += 1;
    } else {
      break;
    }
  }
  return consecutive;
};

const detectStreakStatus = (completedDates: CompletionState, now: Date): StreakStatus => {
  const entries = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    return Boolean(completedDates[toLocalDateKey(day)]);
  });

  const completedCount = entries.filter(Boolean).length;
  const hasGap = entries.some((done, idx) => idx > 0 && entries[idx - 1] && !done);
  const consecutive = computeConsecutiveCompletions(completedDates, now);

  if (consecutive >= 5 || completedCount >= 5) return 'healthy';
  if (completedCount >= 3 && hasGap) return 'atRisk';
  return 'broken';
};

const deriveLastWorkoutAt = (workoutLogsByDate: WorkoutLogsByDateState, schedule: ScheduleState): string | null => {
  let bestTimestamp: number | null = null;

  Object.values(workoutLogsByDate).forEach(workoutMap => {
    Object.values(workoutMap ?? {}).forEach(exerciseMap => {
      Object.values(exerciseMap ?? {}).forEach(entry => {
        const ts = Date.parse(entry.updatedAt ?? '');
        if (!Number.isNaN(ts) && (bestTimestamp == null || ts > bestTimestamp)) {
          bestTimestamp = ts;
        }
      });
    });
  });

  if (bestTimestamp != null) return new Date(bestTimestamp).toISOString();

  const fallbackDateKey = Object.keys(schedule)
    .filter(key => schedule[key])
    .sort()
    .at(-1);

  if (!fallbackDateKey) return null;
  const fallbackDate = parseDateKey(fallbackDateKey);
  return fallbackDate ? fallbackDate.toISOString() : null;
};

const deriveRoutineSignal = (
  schedule: ScheduleState,
  savedWorkouts: SavedWorkout[],
  now: Date
): RoutineSignal | null => {
  const lookbackStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const assignmentCountByWorkout: Record<string, number> = {};

  Object.entries(schedule).forEach(([dateKey, workoutId]) => {
    if (!workoutId) return;
    const date = parseDateKey(dateKey);
    if (!date) return;
    if (date < lookbackStart || date > now) return;
    assignmentCountByWorkout[workoutId] = (assignmentCountByWorkout[workoutId] ?? 0) + 1;
  });

  const top = Object.entries(assignmentCountByWorkout).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;

  const [workoutId, assignmentCount] = top;
  const match = savedWorkouts.find(workout => workout.id === workoutId);
  if (!match) {
    console.warn('[ContextEngine] Missing saved workout for routine signal', workoutId);
    return null;
  }

  const durationFromDescription = (() => {
    const matchDuration = /([0-9]{1,3})\s*min/i.exec(match.description ?? '');
    return matchDuration ? Number(matchDuration[1]) : 0;
  })();

  return {
    workoutId,
    workoutName: match.name || 'Saved workout',
    assignmentCount,
    totalDurationMinutes: durationFromDescription * assignmentCount,
  };
};

export function buildHeroContext(options: BuildHeroContextOptions = {}): HeroDashboardContext {
  const now = options.now ?? new Date();
  const schedule = options.schedule ?? {};
  const completedDates = options.completedDates ?? {};
  const workoutLogsByDate = options.workoutLogsByDate ?? {};
  const savedWorkouts = options.savedWorkouts ?? [];

  const todayKey = toLocalDateKey(now);
  const isRestDay = !Boolean(schedule[todayKey]) || Boolean(completedDates[todayKey]);

  return {
    period: detectPeriod(now),
    isRestDay,
    streakStatus: detectStreakStatus(completedDates, now),
    lastWorkoutAt: deriveLastWorkoutAt(workoutLogsByDate, schedule),
    routineSignal: deriveRoutineSignal(schedule, savedWorkouts, now),
  };
}

/** Existing dashboard compatibility path used by current HeroDashboard */
export class ContextEngine {
  static async resolve(getRecentWorkouts: (daysBack: number) => Promise<WorkoutRecord[]>): Promise<DashboardContext> {
    const timeSlot = detectTimeSlot();
    const workouts = await getRecentWorkouts(30);
    const patterns = calculateStreakAndRecency(workouts);
    return { timeSlot, patterns };
  }
}
