import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FEDB_SEED_SOURCE, FEDB_SEED_VERSION, getFedbSeededExercises, SeededExercise } from '@/data/seededCatalog';

export type ExerciseCatalogState = {
  seededExercises: SeededExercise[];
  seedVersion: string | null;
  seedSource: 'free-exercise-db';
  hasHydrated: boolean;
  seedApplied: boolean;
  setHasHydrated: (value: boolean) => void;
  runSeedIfNeeded: () => void;
  refreshSeedIfVersionChanged: (nextVersion: string) => void;
  getAllExercisesForSelection: () => SeededExercise[];
};

export const useExerciseCatalogStore = create<ExerciseCatalogState>()(
  persist(
    (set, get) => ({
      seededExercises: [],
      seedVersion: null,
      seedSource: FEDB_SEED_SOURCE,
      hasHydrated: false,
      seedApplied: false,
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      runSeedIfNeeded: () => {
        const state = get();
        if (!state.hasHydrated) return;
        if (state.seedApplied && state.seedVersion === FEDB_SEED_VERSION) return;
        state.refreshSeedIfVersionChanged(FEDB_SEED_VERSION);
      },

      refreshSeedIfVersionChanged: (nextVersion: string) => {
        const nextSeedList = getFedbSeededExercises();

        set(() => ({
          seededExercises: nextSeedList,
          seedVersion: nextVersion,
          seedApplied: true,
        }));
      },

      getAllExercisesForSelection: () => {
        return get().seededExercises;
      },
    }),
    {
      name: 'exercise-catalog-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
