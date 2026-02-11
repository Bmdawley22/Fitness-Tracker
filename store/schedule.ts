import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];
export type ScheduleState = Record<WeekDay, string | null>;

const emptySchedule = (): ScheduleState => ({
  Sunday: null,
  Monday: null,
  Tuesday: null,
  Wednesday: null,
  Thursday: null,
  Friday: null,
  Saturday: null,
});

interface ScheduleStoreState {
  schedule: ScheduleState;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  assignWorkoutToDay: (day: WeekDay, workoutId: string) => void;
  clearDay: (day: WeekDay) => void;
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

      assignWorkoutToDay: (day, workoutId) => {
        set(state => ({
          schedule: {
            ...state.schedule,
            [day]: workoutId,
          },
        }));
      },

      clearDay: day => {
        set(state => ({
          schedule: {
            ...state.schedule,
            [day]: null,
          },
        }));
      },

      remapWorkoutId: (oldWorkoutId, newWorkoutId) => {
        if (!oldWorkoutId || !newWorkoutId || oldWorkoutId === newWorkoutId) return;

        const next = { ...get().schedule };
        let changed = false;

        WEEK_DAYS.forEach(day => {
          if (next[day] === oldWorkoutId) {
            next[day] = newWorkoutId;
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

        WEEK_DAYS.forEach(day => {
          if (next[day] === workoutId) {
            next[day] = null;
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

        WEEK_DAYS.forEach(day => {
          if (next[day] && !validIds.has(next[day] as string)) {
            next[day] = null;
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
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
