import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  category: string;
  createdAt: number;
}

interface SavedWorkoutsState {
  savedWorkouts: SavedWorkout[];
  savedExercises: SavedExercise[];
  
  // Workout actions
  addWorkout: (workout: Omit<SavedWorkout, 'id' | 'order' | 'createdAt'>) => boolean;
  removeWorkout: (id: string) => void;
  updateWorkout: (id: string, updates: Partial<SavedWorkout>) => void;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  reorderWorkouts: (workouts: SavedWorkout[]) => void;
  isWorkoutSaved: (originalId: string) => boolean;
  
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
      
      addWorkout: (workout) => {
        const state = get();
        // Check for duplicate
        if (state.savedWorkouts.some(w => w.originalId === workout.originalId)) {
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
      
      removeWorkout: (id) => {
        set(state => ({
          savedWorkouts: state.savedWorkouts.filter(w => w.id !== id)
        }));
      },
      
      updateWorkout: (id, updates) => {
        set(state => ({
          savedWorkouts: state.savedWorkouts.map(w => 
            w.id === id ? { ...w, ...updates } : w
          )
        }));
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
    }
  )
);
