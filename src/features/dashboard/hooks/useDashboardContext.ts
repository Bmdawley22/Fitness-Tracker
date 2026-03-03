// useDashboardContext.ts - Hook to resolve dashboard context and layout

import { useState, useEffect } from 'react';
import { ContextEngine } from '../services/ContextEngine';
import { AdaptiveLayoutEngine } from '../services/AdaptiveLayoutEngine';
import type { DashboardContext, WidgetLayout } from '../types/DashboardContext';

type WorkoutRecord = {
  timestamp: number;
};

type UseDashboardContextResult = {
  context: DashboardContext | null;
  layout: WidgetLayout | null;
  loading: boolean;
};

/**
 * Hook to resolve dashboard context and compute adaptive layout.
 * Handles loading state during context resolution.
 * 
 * @param getRecentWorkouts - Async function to fetch recent workouts from DB
 * @param hasWorkoutHistory - Whether user has any workout history
 */
export function useDashboardContext(
  getRecentWorkouts: (daysBack: number) => Promise<WorkoutRecord[]>,
  hasWorkoutHistory: boolean
): UseDashboardContextResult {
  const [context, setContext] = useState<DashboardContext | null>(null);
  const [layout, setLayout] = useState<WidgetLayout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function resolveContext() {
      try {
        setLoading(true);
        
        // Resolve context from ContextEngine
        const resolvedContext = await ContextEngine.resolve(getRecentWorkouts);
        
        if (!mounted) return;

        // Compute layout from AdaptiveLayoutEngine
        const computedLayout = AdaptiveLayoutEngine.computeLayout(
          resolvedContext,
          hasWorkoutHistory
        );

        setContext(resolvedContext);
        setLayout(computedLayout);
      } catch (error) {
        console.error('Failed to resolve dashboard context:', error);
        
        // Fallback to safe defaults on error
        if (mounted) {
          setContext({
            timeSlot: 'midday',
            patterns: {
              lastWorkoutTs: null,
              streakDays: 0,
              daysSinceLastWorkout: Infinity,
            },
          });
          setLayout({ widgets: ['quickLog'] });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    resolveContext();

    return () => {
      mounted = false;
    };
  }, [getRecentWorkouts, hasWorkoutHistory]);

  return {
    context,
    layout,
    loading,
  };
}
