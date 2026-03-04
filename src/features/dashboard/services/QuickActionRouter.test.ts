import { resolveQuickAction } from './QuickActionRouter';
import type { HeroDashboardContext } from '../types/DashboardContext';

const assert = (label: string, condition: boolean) => {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
};

const baseContext: HeroDashboardContext = {
  period: 'morning',
  isRestDay: false,
  streakStatus: 'healthy',
  lastWorkoutAt: null,
  routineSignal: {
    workoutId: 'w1',
    workoutName: 'Push Day',
    assignmentCount: 2,
    totalDurationMinutes: 90,
  },
};

(() => {
  const [primary, secondary] = resolveQuickAction(baseContext);
  assert('primary with routine is start suggested', primary.actionId === 'start_suggested');
  assert('secondary with routine is summary', secondary.actionId === 'view_routine_summary');

  const [restPrimary] = resolveQuickAction({ ...baseContext, isRestDay: true });
  assert('rest day primary is resume', restPrimary.actionId === 'resume_last_routine');

  const [emptyPrimary, emptySecondary] = resolveQuickAction({ ...baseContext, routineSignal: null });
  assert('no routine primary logs workout', emptyPrimary.actionId === 'log_workout');
  assert('no routine secondary browse routines', emptySecondary.actionId === 'resume_last_routine');
})();
