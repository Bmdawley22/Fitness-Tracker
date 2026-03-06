import assert from 'node:assert/strict';

import { FEDB_SEED_VERSION } from '../data/seededCatalog';
import { useExerciseCatalogStore } from '../store/exerciseCatalog';
import { useSavedWorkoutsStore } from '../store/savedWorkouts';
import { useScheduleStore } from '../store/schedule';

const globalAny = globalThis as any;

if (!globalAny.window) {
  const storage = new Map<string, string>();
  globalAny.window = {
    localStorage: {
      get length() {
        return storage.size;
      },
      clear() {
        storage.clear();
      },
      getItem(key: string) {
        return storage.has(key) ? storage.get(key)! : null;
      },
      key(index: number) {
        return Array.from(storage.keys())[index] ?? null;
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      },
    },
  };
}

const DATE_A = '2026-03-01';
const DATE_B = '2026-03-02';

const resetScheduleStore = () => {
  useScheduleStore.setState({
    schedule: {},
    completedDates: {},
    workoutLogsByDate: {},
    hasHydrated: true,
  });
};

const resetSavedWorkoutsStore = () => {
  useSavedWorkoutsStore.setState({
    savedWorkouts: [],
    savedExercises: [],
    customExercises: [],
    hasHydrated: true,
  });
};

const resetExerciseCatalogStore = () => {
  useExerciseCatalogStore.setState({
    seededExercises: [],
    seedVersion: null,
    seedApplied: false,
    hasHydrated: false,
    seedSource: 'free-exercise-db',
  });
};

const runScheduleAssignmentRemapRemovalSmoke = () => {
  resetScheduleStore();

  const scheduleStore = useScheduleStore.getState();
  scheduleStore.assignWorkoutToDate(DATE_A, 'workout-old');
  scheduleStore.setExerciseLog(DATE_A, 'workout-old', 'exercise-1', {
    setCount: 2,
    sets: [
      { reps: 10, weight: 100 },
      { reps: 12, weight: 105 },
    ],
    updatedAt: '2026-03-01T08:00:00.000Z',
  });

  scheduleStore.assignWorkoutToDate(DATE_A, 'workout-new');

  let nextState = useScheduleStore.getState();
  assert.equal(nextState.schedule[DATE_A], 'workout-new');
  assert.equal(nextState.workoutLogsByDate[DATE_A]?.['workout-old'], undefined);

  scheduleStore.assignWorkoutToDate(DATE_B, 'workout-old');
  scheduleStore.assignWorkoutToDate(DATE_A, 'workout-old');
  scheduleStore.remapWorkoutId('workout-old', 'workout-remapped');

  nextState = useScheduleStore.getState();
  assert.equal(nextState.schedule[DATE_A], 'workout-remapped');
  assert.equal(nextState.schedule[DATE_B], 'workout-remapped');

  scheduleStore.setExerciseLog(DATE_A, 'workout-remapped', 'exercise-2', {
    setCount: 1,
    sets: [{ reps: 8, weight: 80 }],
    updatedAt: '2026-03-01T09:00:00.000Z',
  });
  scheduleStore.setExerciseLog(DATE_B, 'workout-keep', 'exercise-3', {
    setCount: 1,
    sets: [{ reps: 6, weight: 60 }],
    updatedAt: '2026-03-02T09:00:00.000Z',
  });

  scheduleStore.removeAssignmentsForWorkoutId('workout-remapped');

  nextState = useScheduleStore.getState();
  assert.equal(nextState.schedule[DATE_A], undefined);
  assert.equal(nextState.schedule[DATE_B], undefined);
  assert.equal(nextState.workoutLogsByDate[DATE_A]?.['workout-remapped'], undefined);
  assert.ok(nextState.workoutLogsByDate[DATE_B]?.['workout-keep']);
};

const runMaxExerciseConstraintSmoke = () => {
  resetSavedWorkoutsStore();
  resetScheduleStore();

  const savedStore = useSavedWorkoutsStore.getState();
  const maxExerciseIds = Array.from({ length: 12 }, (_, index) => `exercise-${index + 1}`);
  const overLimitExerciseIds = Array.from({ length: 13 }, (_, index) => `exercise-${index + 1}`);

  const rejected = savedStore.addWorkout({
    originalId: 'template-over-limit',
    name: 'Too Many',
    description: 'Should be rejected',
    exercises: overLimitExerciseIds,
  });

  assert.equal(rejected, false);
  assert.equal(useSavedWorkoutsStore.getState().savedWorkouts.length, 0);

  const acceptedId = savedStore.addWorkoutWithId({
    originalId: 'template-max',
    name: 'At Limit',
    description: 'Allowed at 12',
    exercises: maxExerciseIds,
  });

  assert.ok(acceptedId);
  const cannotAppend = useSavedWorkoutsStore.getState().addExerciseToWorkout(acceptedId as string, 'exercise-13');
  assert.equal(cannotAppend, false);

  const acceptedWorkout = useSavedWorkoutsStore.getState().savedWorkouts.find(w => w.id === acceptedId);
  assert.equal(acceptedWorkout?.exercises.length, 12);
};

const runSeedRefreshBehaviorSmoke = () => {
  resetExerciseCatalogStore();

  let exerciseCatalogStore = useExerciseCatalogStore.getState();

  exerciseCatalogStore.runSeedIfNeeded();
  let nextState = useExerciseCatalogStore.getState();
  assert.equal(nextState.seedApplied, false);
  assert.equal(nextState.seedVersion, null);
  assert.equal(nextState.seededExercises.length, 0);

  useExerciseCatalogStore.setState({ hasHydrated: true });
  exerciseCatalogStore = useExerciseCatalogStore.getState();
  exerciseCatalogStore.runSeedIfNeeded();

  nextState = useExerciseCatalogStore.getState();
  assert.equal(nextState.seedApplied, true);
  assert.equal(nextState.seedVersion, FEDB_SEED_VERSION);
  assert.ok(nextState.seededExercises.length > 0);

  const seededReference = nextState.seededExercises;
  exerciseCatalogStore.runSeedIfNeeded();

  nextState = useExerciseCatalogStore.getState();
  assert.equal(nextState.seededExercises, seededReference);

  exerciseCatalogStore.refreshSeedIfVersionChanged('fedb-v-next');
  nextState = useExerciseCatalogStore.getState();
  assert.equal(nextState.seedVersion, 'fedb-v-next');
  assert.equal(nextState.seedApplied, true);
  assert.ok(nextState.seededExercises.length > 0);
};

const tests: Array<{ name: string; run: () => void }> = [
  { name: 'schedule assignment/remap/removal smoke path', run: runScheduleAssignmentRemapRemovalSmoke },
  { name: 'max-exercise constraints smoke path', run: runMaxExerciseConstraintSmoke },
  { name: 'seed refresh behavior smoke path', run: runSeedRefreshBehaviorSmoke },
];

let passed = 0;
for (const smoke of tests) {
  try {
    smoke.run();
    passed += 1;
    console.log(`PASS: ${smoke.name}`);
  } catch (error) {
    console.error(`FAIL: ${smoke.name}`);
    throw error;
  }
}

console.log(`All store smoke tests passed (${passed}/${tests.length}).`);
