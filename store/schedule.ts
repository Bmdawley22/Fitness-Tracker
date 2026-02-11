import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type ScheduleState = Record<string, string>;

const emptySchedule = (): ScheduleState => ({});

export const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ScheduleStoreState {
  schedule: ScheduleState;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  assignWorkoutToDate: (dateKey: string, workoutId: string) => void;
  clearDateAssignment: (dateKey: string) => void;
  remapWorkoutId: (oldWorkoutId: string, newWorkoutId: string) => void;
  removeAssignmentsForWorkoutId: (workoutId: string) => void;
  cleanupInvalidAssignments: (validWorkoutIds: string[]) => void;
}

export const useScheduleStore = create<ScheduleStoreState>()(
  persist(
    (set, get) => ({
      schedule: emptySchedule(),
      hasHydrated: false,
      setHasHydrated: hydrated => set({ hasHydrated: hydrated }),

      assignWorkoutToDate: (dateKey, workoutId) => {
        if (!DATE_KEY_REGEX.test(dateKey) || !workoutId) return;

        set(state => ({
          schedule: {
            ...state.schedule,
            [dateKey]: workoutId,
          },
        }));
      },

      clearDateAssignment: dateKey => {
        if (!DATE_KEY_REGEX.test(dateKey)) return;

        set(state => ({
          schedule: Object.fromEntries(Object.entries(state.schedule).filter(([key]) => key !== dateKey)),
        }));
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

        const next = { ...get().schedule };
        let changed = false;

        Object.keys(next).forEach(dateKey => {
          if (next[dateKey] === workoutId) {
            delete next[dateKey];
            changed = true;
          }
        });

        if (changed) {
          set({ schedule: next });
        }
      },

      cleanupInvalidAssignments: validWorkoutIds => {
        const validIds = new Set(validWorkoutIds);
        const next = { ...get().schedule };
        let changed = false;

        Object.keys(next).forEach(dateKey => {
          if (!DATE_KEY_REGEX.test(dateKey) || !validIds.has(next[dateKey])) {
            delete next[dateKey];
            changed = true;
          }
        });

        if (changed) {
          set({ schedule: next });
        }
      },
    }),
    {
      name: 'schedule-storage',
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown) => {
        const state = (persistedState as { schedule?: unknown; hasHydrated?: unknown } | undefined) ?? {};
        const persistedSchedule = state.schedule;
        const nextSchedule: ScheduleState = {};

        if (persistedSchedule && typeof persistedSchedule === 'object') {
          Object.entries(persistedSchedule as Record<string, unknown>).forEach(([key, value]) => {
            if (DATE_KEY_REGEX.test(key) && typeof value === 'string' && value.length > 0) {
              nextSchedule[key] = value;
            }
          });
        }

        return {
          ...state,
          schedule: nextSchedule,
          hasHydrated: false,
        };
      },
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
