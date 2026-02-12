import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScheduleStore } from '@/store/schedule';

const MAX_EXERCISES = 12;

export interface SavedWorkout {
  id: string;
  originalId: string; // Reference to original workout
  name: string;
  description: string;
  exercises: string[]; // Exercise IDs
  order: number; // For manual ordering
  createdAt: number;
}

export interface SavedExercise {
  id: string;
  originalId: string;
  name: string;
  description: string;
  category?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipment?: string;
  instructions?: string;
  image?: string;
  createdAt: number;
}

export interface CustomExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipment?: string;
  instructions?: string;
  image?: string;
  createdAt: number;
}

interface SavedWorkoutsState {
  savedWorkouts: SavedWorkout[];
  savedExercises: SavedExercise[];
  customExercises: CustomExercise[];
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  
  addCustomExercise: (exercise: Omit<CustomExercise, 'id' | 'createdAt'>) => CustomExercise;
  
  // Workout actions
  addWorkout: (workout: Omit<SavedWorkout, 'id' | 'order' | 'createdAt'>) => boolean;
  addWorkoutWithId: (workout: Omit<SavedWorkout, 'id' | 'order' | 'createdAt'>) => string | null;
  removeWorkout: (id: string) => void;
  updateWorkout: (id: string, updates: Partial<SavedWorkout>) => void;
  updateAndRegenerateId: (id: string, updates: Partial<SavedWorkout>) => void;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  reorderWorkouts: (workouts: SavedWorkout[]) => void;
  isWorkoutSaved: (originalId: string) => boolean;
  
  // Add exercise to workout
  addExerciseToWorkout: (workoutId: string, exerciseId: string) => boolean;
  
  // Exercise actions
  addExercise: (exercise: Omit<SavedExercise, 'id' | 'createdAt'>) => boolean;
  removeExercise: (id: string) => void;
  isExerciseSaved: (originalId: string) => boolean;
}

export const useSavedWorkoutsStore = create<SavedWorkoutsState>()(
  persist(
    (set, get) => ({
      savedWorkouts: [],
      savedExercises: [],
      customExercises: [],
      hasHydrated: false,
      setHasHydrated: hydrated => set({ hasHydrated: hydrated }),
      
      addWorkout: (workout) => {
        const state = get();
        // Check for duplicate
        if (state.savedWorkouts.some(w => w.originalId === workout.originalId)) {
          return false;
        }

        if (workout.exercises.length > MAX_EXERCISES) {
          return false;
        }
        
        const newWorkout: SavedWorkout = {
          ...workout,
          id: `saved-${Date.now()}`,
          order: state.savedWorkouts.length,
          createdAt: Date.now(),
        };
        
        set({ savedWorkouts: [...state.savedWorkouts, newWorkout] });
        return true;
      },

      addWorkoutWithId: (workout) => {
        const state = get();
        if (state.savedWorkouts.some(w => w.originalId === workout.originalId)) {
          return null;
        }

        if (workout.exercises.length > MAX_EXERCISES) {
          return null;
        }

        const newWorkout: SavedWorkout = {
          ...workout,
          id: `saved-${Date.now()}`,
          order: state.savedWorkouts.length,
          createdAt: Date.now(),
        };

        set({ savedWorkouts: [...state.savedWorkouts, newWorkout] });
        return newWorkout.id;
      },
      
      removeWorkout: (id) => {
        set(state => ({
          savedWorkouts: state.savedWorkouts.filter(w => w.id !== id)
        }));
        useScheduleStore.getState().removeAssignmentsForWorkoutId(id);
      },
      
      updateWorkout: (id, updates) => {
        set(state => ({
          savedWorkouts: state.savedWorkouts.map(w => 
            w.id === id ? { ...w, ...updates } : w
          )
        }));
      },
      
      updateAndRegenerateId: (id, updates) => {
        let oldWorkoutId: string | null = null;
        let newWorkoutId: string | null = null;

        set(state => {
          const workoutToUpdate = state.savedWorkouts.find(w => w.id === id);
          if (!workoutToUpdate) return state;

          oldWorkoutId = workoutToUpdate.id;
          newWorkoutId = `saved-${Date.now()}`;

          const updatedWorkout: SavedWorkout = {
            ...workoutToUpdate,
            ...updates,
            id: newWorkoutId,
            originalId: '', // Clear originalId - this is now a custom edited workout
            createdAt: Date.now(),
          };

          return {
            savedWorkouts: state.savedWorkouts.map(w =>
              w.id === id ? updatedWorkout : w
            )
          };
        });

        if (oldWorkoutId && newWorkoutId) {
          useScheduleStore.getState().remapWorkoutId(oldWorkoutId, newWorkoutId);
        }
      },
      
      removeExerciseFromWorkout: (workoutId, exerciseId) => {
        set(state => ({
          savedWorkouts: state.savedWorkouts.map(w => 
            w.id === workoutId 
              ? { ...w, exercises: w.exercises.filter(e => e !== exerciseId) }
              : w
          )
        }));
      },
      
      reorderWorkouts: (workouts) => {
        set({ savedWorkouts: workouts.map((w, i) => ({ ...w, order: i })) });
      },
      
      isWorkoutSaved: (originalId) => {
        return get().savedWorkouts.some(w => w.originalId === originalId);
      },
      
      addExerciseToWorkout: (workoutId, exerciseId) => {
        const state = get();
        const workout = state.savedWorkouts.find(w => w.id === workoutId);
        
        if (!workout) {
          return false;
        }

        if (workout.exercises.length >= MAX_EXERCISES) {
          return false;
        }

        // Check for duplicate
        if (workout.exercises.includes(exerciseId)) {
          return false;
        }
        
        set(state => ({
          savedWorkouts: state.savedWorkouts.map(w =>
            w.id === workoutId
              ? { ...w, exercises: [...w.exercises, exerciseId] }
              : w
          )
        }));
        
        return true;
      },
      
      addExercise: (exercise) => {
        const state = get();
        if (state.savedExercises.some(e => e.originalId === exercise.originalId)) {
          return false;
        }
        
        const newExercise: SavedExercise = {
          ...exercise,
          id: `saved-ex-${Date.now()}`,
          createdAt: Date.now(),
        };
        
        set({ savedExercises: [...state.savedExercises, newExercise] });
        return true;
      },
      
      addCustomExercise: (exercise) => {
        const newExercise: CustomExercise = {
          ...exercise,
          id: `custom-ex-${Date.now()}`,
          createdAt: Date.now(),
        };
        
        set(state => ({ customExercises: [...state.customExercises, newExercise] }));
        return newExercise;
      },
      
      removeExercise: (id) => {
        set(state => ({
          savedExercises: state.savedExercises.filter(e => e.id !== id)
        }));
      },
      
      isExerciseSaved: (originalId) => {
        return get().savedExercises.some(e => e.originalId === originalId);
      },
    }),
    {
      name: 'saved-workouts-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
