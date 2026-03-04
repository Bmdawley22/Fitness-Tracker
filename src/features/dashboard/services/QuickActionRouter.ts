import type { HeroDashboardContext } from '../types/DashboardContext';

export type QuickActionId = 'start_suggested' | 'resume_last_routine' | 'log_workout' | 'view_routine_summary';

export type QuickActionOutcome = {
  actionId: QuickActionId;
  label: string;
  targetScreen: string;
  telemetryAction: string;
};

type RouteOverrides = Partial<Record<QuickActionId, string>>;

const DEFAULT_TARGETS: Record<QuickActionId, string> = {
  start_suggested: '/(tabs)/workouts',
  resume_last_routine: '/(tabs)/workouts',
  log_workout: '/(tabs)/add',
  view_routine_summary: '/(tabs)/workouts',
};

const targetFor = (actionId: QuickActionId, overrides?: RouteOverrides): string => overrides?.[actionId] ?? DEFAULT_TARGETS[actionId];

export function resolveQuickAction(context: HeroDashboardContext, overrides?: RouteOverrides): QuickActionOutcome[] {
  const primary: QuickActionOutcome = context.routineSignal
    ? {
        actionId: context.isRestDay ? 'resume_last_routine' : 'start_suggested',
        label: context.isRestDay ? 'Resume routine' : 'Start suggested',
        targetScreen: targetFor(context.isRestDay ? 'resume_last_routine' : 'start_suggested', overrides),
        telemetryAction: 'hero_primary_action',
      }
    : {
        actionId: 'log_workout',
        label: 'Log workout',
        targetScreen: targetFor('log_workout', overrides),
        telemetryAction: 'hero_primary_action',
      };

  const secondary: QuickActionOutcome = context.routineSignal
    ? {
        actionId: 'view_routine_summary',
        label: 'View routine summary',
        targetScreen: targetFor('view_routine_summary', overrides),
        telemetryAction: 'hero_secondary_action',
      }
    : {
        actionId: 'resume_last_routine',
        label: 'Browse saved routines',
        targetScreen: targetFor('resume_last_routine', overrides),
        telemetryAction: 'hero_secondary_action',
      };

  return [primary, secondary];
}
