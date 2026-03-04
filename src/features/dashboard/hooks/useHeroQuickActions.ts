import { useMemo } from 'react';
import type { HeroDashboardContext } from '../types/DashboardContext';
import type { QuickActionOutcome } from '../services/QuickActionRouter';
import { resolveQuickAction } from '../services/QuickActionRouter';

type RouterLike = { push: (path: any) => void };

type UseHeroQuickActionsArgs = {
  context: HeroDashboardContext | null;
  router: RouterLike;
  track: (eventType: any, payload?: Record<string, any>) => void;
  onLogWorkout: () => void;
  onStartWorkout: () => void;
  onResumeWorkout?: () => void;
  refreshContext?: () => void;
};

export function useHeroQuickActions({
  context,
  router,
  track,
  onLogWorkout,
  onStartWorkout,
  onResumeWorkout,
  refreshContext,
}: UseHeroQuickActionsArgs) {
  const quickActions = useMemo(() => {
    if (!context) {
      return [
        { actionId: 'log_workout', label: 'Log workout', targetScreen: '/(tabs)/add', telemetryAction: 'hero_primary_action' },
        { actionId: 'resume_last_routine', label: 'Browse saved routines', targetScreen: '/(tabs)/workouts', telemetryAction: 'hero_secondary_action' },
      ] as QuickActionOutcome[];
    }
    return resolveQuickAction(context);
  }, [context]);
  const [primary, secondary] = quickActions;

  const contextId = context ? `${context.period}_${context.streakStatus}_${context.isRestDay ? 'rest' : 'active'}` : 'none';

  const runAction = (action: QuickActionOutcome) => {
    track('hero_cta_click', {
      actionId: action.actionId,
      contextId,
      targetScreen: action.targetScreen,
      result: 'invoked',
    });

    if (action.actionId === 'log_workout') {
      onLogWorkout();
      router.push(action.targetScreen);
      refreshContext?.();
      return;
    }
    if (action.actionId === 'resume_last_routine') {
      onResumeWorkout?.();
      router.push(action.targetScreen);
      return;
    }

    onStartWorkout();
    router.push(action.targetScreen);
  };

  return {
    quickActions,
    primaryLabel: primary.label,
    secondaryLabel: secondary.label,
    handlePrimaryAction: () => runAction(primary),
    handleSecondaryAction: () => runAction(secondary),
  };
}
