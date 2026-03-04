import { shouldHighlightPrimaryAction } from './HeroDashboard';
import type { AdaptiveLayout } from '../services/AdaptiveLayoutEngine';

const assert = (label: string, condition: boolean) => {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
};

const baseLayout: AdaptiveLayout = {
  widgets: ['suggested', 'streak', 'quickLog'],
  subtitle: 'Morning momentum',
  primaryAction: {
    actionId: 'resume_last_routine',
    label: 'Resume routine',
    target: '/(tabs)/workouts',
  },
  secondaryAction: {
    actionId: 'view_routine_summary',
    label: 'View routine summary',
    target: '/(tabs)/workouts',
  },
};

(() => {
  assert('null layout does not highlight', shouldHighlightPrimaryAction(null) === false);

  assert(
    'start_suggested highlights by action id',
    shouldHighlightPrimaryAction({
      ...baseLayout,
      primaryAction: { ...baseLayout.primaryAction, actionId: 'start_suggested' },
    }) === true
  );

  assert(
    'explicit highlight flag also highlights',
    shouldHighlightPrimaryAction({
      ...baseLayout,
      primaryAction: { ...baseLayout.primaryAction, highlight: true },
    }) === true
  );

  assert('non-highlight action remains false', shouldHighlightPrimaryAction(baseLayout) === false);
})();
