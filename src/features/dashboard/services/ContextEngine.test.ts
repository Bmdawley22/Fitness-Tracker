import { buildHeroContext } from './ContextEngine';

const baseNow = new Date('2026-03-04T08:00:00.000Z');

const assert = (label: string, condition: boolean) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${label}`);
  }
};

(() => {
  const morning = buildHeroContext({ now: new Date('2026-03-04T06:00:00') });
  const evening = buildHeroContext({ now: new Date('2026-03-04T18:00:00') });
  assert('period bucket morning', morning.period === 'morning');
  assert('period bucket evening', evening.period === 'evening');

  const healthy = buildHeroContext({
    now: baseNow,
    completedDates: {
      '2026-03-04': true,
      '2026-03-03': true,
      '2026-03-02': true,
      '2026-03-01': true,
      '2026-02-28': true,
    },
  });
  assert('healthy streak status', healthy.streakStatus === 'healthy');

  const atRisk = buildHeroContext({
    now: baseNow,
    completedDates: {
      '2026-03-04': true,
      '2026-03-02': true,
      '2026-03-01': true,
    },
  });
  assert('at risk streak status', atRisk.streakStatus === 'atRisk');

  const fallback = buildHeroContext({
    now: baseNow,
    schedule: { '2026-03-03': 'saved-1' },
    savedWorkouts: [{
      id: 'saved-1',
      originalId: '1',
      name: 'Push Day',
      description: '45 min strength',
      exercises: [],
      order: 0,
      createdAt: Date.now(),
    }],
  });
  assert('lastWorkoutAt fallback', fallback.lastWorkoutAt !== null);
  assert('routine signal exists', fallback.routineSignal?.workoutName === 'Push Day');
})();
