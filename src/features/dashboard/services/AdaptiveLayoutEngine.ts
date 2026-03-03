// AdaptiveLayoutEngine.ts - Select widgets based on dashboard context

import type { DashboardContext, WidgetLayout, WidgetType } from '../types/DashboardContext';

/**
 * Adaptive Layout Engine - Selects widgets based on user context.
 * 
 * Rules:
 * 1. If streakDays >= 3 AND daysSinceLastWorkout === 0:
 *    → Show StreakBadgeWidget (variant: 'active')
 * 2. If timeSlot === 'morning' AND user has workout history:
 *    → Show SuggestedWorkoutWidget
 * 3. Always include QuickLogWidget
 * 
 * Widget priority order: StreakBadge (top) → SuggestedWorkout → QuickLog (bottom)
 */
export class AdaptiveLayoutEngine {
  static computeLayout(context: DashboardContext, hasWorkoutHistory: boolean): WidgetLayout {
    const widgets: WidgetType[] = [];

    const { timeSlot, patterns } = context;
    const { streakDays, daysSinceLastWorkout } = patterns;

    // Rule 1: Show streak badge if active streak (≥3 days and worked out today)
    if (streakDays >= 3 && daysSinceLastWorkout === 0) {
      widgets.push('streak');
    }

    // Rule 2: Show suggested workout in morning if user has workout history
    if (timeSlot === 'morning' && hasWorkoutHistory) {
      widgets.push('suggested');
    }

    // Rule 3: Always show quick log widget
    widgets.push('quickLog');

    return { widgets };
  }
}
