import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type ScheduleState = Record<string, string>;
export type CompletionState = Record<string, boolean>;

export type ExerciseLogSet = { reps: number; weight: number };
export type ExerciseLogEntry = {
  setCount: number;
  sets: ExerciseLogSet[];
  updatedAt: string;
};
export type WorkoutLogsByDateState = Record<string, Record<string, Record<string, ExerciseLogEntry>>>;

const emptySchedule = (): ScheduleState => ({});
const emptyCompletions = (): CompletionState => ({});
const emptyWorkoutLogsByDate = (): WorkoutLogsByDateState => ({});

const normalizeReps = (value: number): number => {
  const nearestEven = Math.round(Math.floor(value) / 2) * 2;
  return Math.min(30, Math.max(2, nearestEven));
};

const normalizeWeight = (value: number): number => {
  const nearestFive = Math.round(Math.floor(value) / 5) * 5;
  return Math.min(500, Math.max(5, nearestFive));
};

export const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ScheduleStoreState {
  schedule: ScheduleState;
  completedDates: CompletionState;
  workoutLogsByDate: WorkoutLogsByDateState;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  assignWorkoutToDate: (dateKey: string, workoutId: string) => void;
  clearDateAssignment: (dateKey: string) => void;
  setDateCompleted: (dateKey: string, completed: boolean) => void;
  toggleDateCompleted: (dateKey: string) => void;
  setExerciseLog: (dateKey: string, workoutId: string, exerciseId: string, entry: ExerciseLogEntry) => void;
  clearLogsForDateWorkout: (dateKey: string, workoutId: string) => void;
  remapWorkoutId: (oldWorkoutId: string, newWorkoutId: string) => void;
  removeAssignmentsForWorkoutId: (workoutId: string) => void;
  cleanupInvalidAssignments: (validWorkoutIds: string[]) => void;
}

export const useScheduleStore = create<ScheduleStoreState>()(
  persist(
    (set, get) => ({
      schedule: emptySchedule(),
      completedDates: emptyCompletions(),
      workoutLogsByDate: emptyWorkoutLogsByDate(),
      hasHydrated: false,
      setHasHydrated: hydrated => set({ hasHydrated: hydrated }),

      assignWorkoutToDate: (dateKey, workoutId) => {
        if (!DATE_KEY_REGEX.test(dateKey) || !workoutId) return;

        set(state => {
          const previousWorkoutId = state.schedule[dateKey];
          const nextWorkoutLogsByDate = { ...state.workoutLogsByDate };

          if (previousWorkoutId && previousWorkoutId !== workoutId && nextWorkoutLogsByDate[dateKey]?.[previousWorkoutId]) {
            const nextDateLogs = { ...nextWorkoutLogsByDate[dateKey] };
            delete nextDateLogs[previousWorkoutId];

            if (Object.keys(nextDateLogs).length === 0) {
              delete nextWorkoutLogsByDate[dateKey];
            } else {
              nextWorkoutLogsByDate[dateKey] = nextDateLogs;
            }
          }

          return {
            schedule: {
              ...state.schedule,
              [dateKey]: workoutId,
            },
            workoutLogsByDate: nextWorkoutLogsByDate,
          };
        });
      },

      clearDateAssignment: dateKey => {
        if (!DATE_KEY_REGEX.test(dateKey)) return;

        set(state => {
          const { [dateKey]: _removedSchedule, ...restSchedule } = state.schedule;
          const { [dateKey]: _removedCompleted, ...restCompleted } = state.completedDates;
          const { [dateKey]: _removedLogs, ...restLogs } = state.workoutLogsByDate;

          return {
            schedule: restSchedule,
            completedDates: restCompleted,
            workoutLogsByDate: restLogs,
          };
        });
      },

      setDateCompleted: (dateKey, completed) => {
        if (!DATE_KEY_REGEX.test(dateKey)) return;

        set(state => {
          if (!completed) {
            const { [dateKey]: _removed, ...rest } = state.completedDates;
            return { completedDates: rest };
          }

          return {
            completedDates: {
              ...state.completedDates,
              [dateKey]: true,
            },
          };
        });
      },

      toggleDateCompleted: dateKey => {
        if (!DATE_KEY_REGEX.test(dateKey)) return;

        const isCompleted = Boolean(get().completedDates[dateKey]);
        get().setDateCompleted(dateKey, !isCompleted);
      },

      setExerciseLog: (dateKey, workoutId, exerciseId, entry) => {
        if (!DATE_KEY_REGEX.test(dateKey) || !workoutId || !exerciseId) return;

        const safeSetCount = Math.min(6, Math.max(1, Math.floor(entry.setCount)));
        const safeSets = entry.sets
          .slice(0, safeSetCount)
          .map(setRow => ({
            reps: normalizeReps(setRow.reps),
            weight: normalizeWeight(setRow.weight),
          }));

        set(state => ({
          workoutLogsByDate: {
            ...state.workoutLogsByDate,
            [dateKey]: {
              ...(state.workoutLogsByDate[dateKey] ?? {}),
              [workoutId]: {
                ...((state.workoutLogsByDate[dateKey] ?? {})[workoutId] ?? {}),
                [exerciseId]: {
                  setCount: safeSetCount,
                  sets: safeSets,
                  updatedAt: entry.updatedAt,
                },
              },
            },
          },
        }));
      },

      clearLogsForDateWorkout: (dateKey, workoutId) => {
        if (!DATE_KEY_REGEX.test(dateKey) || !workoutId) return;

        set(state => {
          const dateLogs = state.workoutLogsByDate[dateKey];
          if (!dateLogs?.[workoutId]) return state;

          const nextDateLogs = { ...dateLogs };
          delete nextDateLogs[workoutId];

          if (Object.keys(nextDateLogs).length === 0) {
            const { [dateKey]: _removedDate, ...restLogs } = state.workoutLogsByDate;
            return { workoutLogsByDate: restLogs };
          }

          return {
            workoutLogsByDate: {
              ...state.workoutLogsByDate,
              [dateKey]: nextDateLogs,
            },
          };
        });
      },

      remapWorkoutId: (oldWorkoutId, newWorkoutId) => {
        if (!oldWorkoutId || !newWorkoutId || oldWorkoutId === newWorkoutId) return;

        const next = { ...get().schedule };
        let changed = false;

        Object.keys(next).forEach(dateKey => {
          if (next[dateKey] === oldWorkoutId) {
            next[dateKey] = newWorkoutId;
            changed = true;
          }
        });

        if (changed) {
          set({ schedule: next });
        }
      },

      removeAssignmentsForWorkoutId: workoutId => {
        if (!workoutId) return;

        const nextSchedule = { ...get().schedule };
        const nextLogs = { ...get().workoutLogsByDate };
        let changed = false;

        Object.keys(nextSchedule).forEach(dateKey => {
          if (nextSchedule[dateKey] === workoutId) {
            delete nextSchedule[dateKey];
            changed = true;
          }
        });

        Object.keys(nextLogs).forEach(dateKey => {
          if (nextLogs[dateKey]?.[workoutId]) {
            const nextDateLogs = { ...nextLogs[dateKey] };
            delete nextDateLogs[workoutId];
            if (Object.keys(nextDateLogs).length === 0) {
              delete nextLogs[dateKey];
            } else {
              nextLogs[dateKey] = nextDateLogs;
            }
            changed = true;
          }
        });

        if (changed) {
          set({ schedule: nextSchedule, workoutLogsByDate: nextLogs });
        }
      },

      cleanupInvalidAssignments: validWorkoutIds => {
        const validIds = new Set(validWorkoutIds);
        const nextSchedule = { ...get().schedule };
        const nextLogs = { ...get().workoutLogsByDate };
        let changed = false;

        Object.keys(nextSchedule).forEach(dateKey => {
          if (!DATE_KEY_REGEX.test(dateKey) || !validIds.has(nextSchedule[dateKey])) {
            delete nextSchedule[dateKey];
            changed = true;
          }
        });

        Object.keys(nextLogs).forEach(dateKey => {
          if (!DATE_KEY_REGEX.test(dateKey)) {
            delete nextLogs[dateKey];
            changed = true;
            return;
          }

          const nextDateLogs = { ...nextLogs[dateKey] };
          let dateChanged = false;
          Object.keys(nextDateLogs).forEach(workoutId => {
            if (!validIds.has(workoutId)) {
              delete nextDateLogs[workoutId];
              dateChanged = true;
            }
          });

          if (dateChanged) {
            if (Object.keys(nextDateLogs).length === 0) {
              delete nextLogs[dateKey];
            } else {
              nextLogs[dateKey] = nextDateLogs;
            }
            changed = true;
          }
        });

        if (changed) {
          set({ schedule: nextSchedule, workoutLogsByDate: nextLogs });
        }
      },
    }),
    {
      name: 'schedule-storage',
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown) => {
        const state = (persistedState as {
          schedule?: unknown;
          completedDates?: unknown;
          workoutLogsByDate?: unknown;
          hasHydrated?: unknown;
        } | undefined) ?? {};
        const persistedSchedule = state.schedule;
        const persistedCompletions = state.completedDates;
        const persistedWorkoutLogsByDate = state.workoutLogsByDate;
        const nextSchedule: ScheduleState = {};
        const nextCompletions: CompletionState = {};
        const nextWorkoutLogsByDate: WorkoutLogsByDateState = {};

        if (persistedSchedule && typeof persistedSchedule === 'object') {
          Object.entries(persistedSchedule as Record<string, unknown>).forEach(([key, value]) => {
            if (DATE_KEY_REGEX.test(key) && typeof value === 'string' && value.length > 0) {
              nextSchedule[key] = value;
            }
          });
        }

        if (persistedCompletions && typeof persistedCompletions === 'object') {
          Object.entries(persistedCompletions as Record<string, unknown>).forEach(([key, value]) => {
            if (DATE_KEY_REGEX.test(key) && value === true) {
              nextCompletions[key] = true;
            }
          });
        }

        if (persistedWorkoutLogsByDate && typeof persistedWorkoutLogsByDate === 'object') {
          Object.entries(persistedWorkoutLogsByDate as Record<string, unknown>).forEach(([dateKey, dateValue]) => {
            if (!DATE_KEY_REGEX.test(dateKey) || !dateValue || typeof dateValue !== 'object') return;

            const nextDateLogs: Record<string, Record<string, ExerciseLogEntry>> = {};

            Object.entries(dateValue as Record<string, unknown>).forEach(([workoutId, workoutValue]) => {
              if (!workoutId || !workoutValue || typeof workoutValue !== 'object') return;

              const nextWorkoutLogs: Record<string, ExerciseLogEntry> = {};

              Object.entries(workoutValue as Record<string, unknown>).forEach(([exerciseId, exerciseValue]) => {
                if (!exerciseId || !exerciseValue || typeof exerciseValue !== 'object') return;

                const rawEntry = exerciseValue as { setCount?: unknown; sets?: unknown; updatedAt?: unknown };
                const setCount = typeof rawEntry.setCount === 'number' ? Math.min(6, Math.max(1, Math.floor(rawEntry.setCount))) : null;
                const updatedAt = typeof rawEntry.updatedAt === 'string' ? rawEntry.updatedAt : '';

                if (!setCount || !Array.isArray(rawEntry.sets)) return;

                const sets = rawEntry.sets
                  .slice(0, setCount)
                  .map(setRow => {
                    const candidate = setRow as { reps?: unknown; weight?: unknown };
                    const reps = typeof candidate?.reps === 'number' ? normalizeReps(candidate.reps) : 2;
                    const weight = typeof candidate?.weight === 'number' ? normalizeWeight(candidate.weight) : 5;
                    return { reps, weight };
                  });

                if (sets.length === 0) return;

                nextWorkoutLogs[exerciseId] = {
                  setCount,
                  sets,
                  updatedAt,
                };
              });

              if (Object.keys(nextWorkoutLogs).length > 0) {
                nextDateLogs[workoutId] = nextWorkoutLogs;
              }
            });

            if (Object.keys(nextDateLogs).length > 0) {
              nextWorkoutLogsByDate[dateKey] = nextDateLogs;
            }
          });
        }

        return {
          ...state,
          schedule: nextSchedule,
          completedDates: nextCompletions,
          workoutLogsByDate: nextWorkoutLogsByDate,
          hasHydrated: false,
        };
      },
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
