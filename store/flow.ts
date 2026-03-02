import { create } from 'zustand';
import { toLocalDateKey, useScheduleStore } from '@/store/schedule';
import { logTelemetry } from '@/lib/telemetry';

export type FlowSource = 'hero-cta' | 'card-plus' | 'quick-create';
export type FlowStatus = 'idle' | 'running' | 'paused' | 'completed';

interface FlowStoreState {
  activeWorkoutId: string | null;
  status: FlowStatus;
  currentExerciseIndex: number;
  source: FlowSource | null;
  startFlow: (workoutId: string, source: FlowSource) => void;
  pauseFlow: () => void;
  resumeFlow: () => void;
  nextExercise: (maxExercises: number) => void;
  completeFlow: () => void;
  resetFlow: () => void;
}

export const useFlowStore = create<FlowStoreState>(set => ({
  activeWorkoutId: null,
  status: 'idle',
  currentExerciseIndex: 0,
  source: null,
  startFlow: (workoutId, source) => {
    if (!workoutId) return;
    logTelemetry('flow_start', { workoutId, source });
    set({
      activeWorkoutId: workoutId,
      status: 'running',
      currentExerciseIndex: 0,
      source,
    });
  },
  pauseFlow: () => set(state => {
    if (state.status !== 'running') return state;
    logTelemetry('flow_state', { status: 'paused' });
    return { ...state, status: 'paused' };
  }),
  resumeFlow: () => set(state => {
    if (state.status !== 'paused') return state;
    logTelemetry('flow_state', { status: 'running' });
    return { ...state, status: 'running' };
  }),
  nextExercise: (maxExercises) => set(state => {
    if (state.status === 'completed' || !state.activeWorkoutId) return state;
    const nextIndex = state.currentExerciseIndex + 1;
    if (nextIndex >= maxExercises) {
      useFlowStore.getState().completeFlow();
      return state;
    }
    logTelemetry('flow_state', { status: 'running', transition: 'next' });
    return { ...state, currentExerciseIndex: nextIndex };
  }),
  completeFlow: () => set(state => {
    if (state.status === 'completed' || !state.activeWorkoutId) return state;
    const todayKey = toLocalDateKey(new Date());
    useScheduleStore.getState().setDateCompleted(todayKey, true);
    logTelemetry('flow_completion', { workoutId: state.activeWorkoutId });
    return { ...state, status: 'completed' };
  }),
  resetFlow: () => set({
    activeWorkoutId: null,
    status: 'idle',
    currentExerciseIndex: 0,
    source: null,
  }),
}));
