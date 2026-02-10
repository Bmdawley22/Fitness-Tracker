import { create } from 'zustand';

interface UIState {
  // Workouts tab state for rename flow
  workoutToEditId: string | null;
  pendingWorkoutToAddId: string | null;
  pendingWorkoutToAddName: string | null;
  
  setWorkoutEditState: (editId: string | null, toAddId: string | null, toAddName: string | null) => void;
  clearWorkoutEditState: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  workoutToEditId: null,
  pendingWorkoutToAddId: null,
  pendingWorkoutToAddName: null,
  
  setWorkoutEditState: (editId, toAddId, toAddName) => set({
    workoutToEditId: editId,
    pendingWorkoutToAddId: toAddId,
    pendingWorkoutToAddName: toAddName,
  }),
  
  clearWorkoutEditState: () => set({
    workoutToEditId: null,
    pendingWorkoutToAddId: null,
    pendingWorkoutToAddName: null,
  }),
}));
