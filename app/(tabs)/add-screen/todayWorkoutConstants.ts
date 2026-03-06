export const DEFAULT_SET_COUNT = 3;
export const MIN_SET_COUNT = 1;
export const MAX_SET_COUNT = 6;
export const DEFAULT_REPS = 6;
export const REP_OPTIONS = Array.from({ length: 15 }, (_, index) => (index + 1) * 2);
export const WEIGHT_OPTIONS = Array.from({ length: 100 }, (_, index) => (index + 1) * 5);

export type ExerciseSetDraft = { reps: string; weight: string };
