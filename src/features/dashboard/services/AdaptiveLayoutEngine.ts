import type { DashboardContext, HeroDashboardContext, WidgetLayout, WidgetType } from '../types/DashboardContext';

export type QuickActionId = 'resume_last_routine' | 'start_suggested' | 'log_workout' | 'view_routine_summary';

export type QuickActionDescriptor = {
  actionId: QuickActionId;
  label: string;
  target: string;
  highlight?: boolean;
};

export type AdaptiveLayout = {
  widgets: WidgetType[];
  subtitle: string;
  primaryAction: QuickActionDescriptor;
  secondaryAction: QuickActionDescriptor;
};

export class AdaptiveLayoutEngine {
  // Legacy API support for Step 1 scaffolding.
  static computeLayout(context: DashboardContext, hasWorkoutHistory: boolean): WidgetLayout {
    const widgets: WidgetType[] = [];
    if (context.patterns.streakDays >= 3 && context.patterns.daysSinceLastWorkout === 0) widgets.push('streak');
    if (context.timeSlot === 'morning' && hasWorkoutHistory) widgets.push('suggested');
    widgets.push('quickLog');
    return { widgets };
  }

  static buildLayout(context: HeroDashboardContext): AdaptiveLayout {
    const widgets: WidgetType[] = ['quickLog'];

    if (context.streakStatus === 'atRisk') {
      widgets.unshift('streak');
      widgets.splice(1, 0, 'suggested');
    } else {
      widgets.unshift('suggested');
      widgets.splice(1, 0, 'streak');
    }

    const subtitle = context.isRestDay
      ? 'Rest day — recover and plan the next session.'
      : context.streakStatus === 'atRisk'
      ? 'Streak at risk — lock in today to keep momentum.'
      : context.period === 'morning'
      ? 'Morning momentum — prime your day with movement.'
      : 'Stay consistent — pick up where you left off.';

    const primaryAction: QuickActionDescriptor = context.routineSignal
      ? {
          actionId: context.isRestDay ? 'resume_last_routine' : 'start_suggested',
          label: context.isRestDay ? 'Resume routine' : 'Start suggested',
          target: '/(tabs)/workouts',
          highlight: !context.isRestDay,
        }
      : {
          actionId: 'log_workout',
          label: 'Log workout',
          target: '/(tabs)/add',
        };

    const secondaryAction: QuickActionDescriptor = context.routineSignal
      ? {
          actionId: 'view_routine_summary',
          label: 'View routine summary',
          target: '/(tabs)/workouts',
        }
      : {
          actionId: 'resume_last_routine',
          label: 'Browse saved routines',
          target: '/(tabs)/workouts',
        };

    return { widgets, subtitle, primaryAction, secondaryAction };
  }
}
