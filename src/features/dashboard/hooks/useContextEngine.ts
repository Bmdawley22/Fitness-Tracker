import { useCallback, useMemo, useState } from 'react';
import { useScheduleStore } from '@/store/schedule';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';
import { useExerciseCatalogStore } from '@/store/exerciseCatalog';
import { buildHeroContext } from '../services/ContextEngine';

export function useContextEngine() {
  const { schedule, completedDates, workoutLogsByDate, hasHydrated: scheduleHydrated } = useScheduleStore();
  const { savedWorkouts, hasHydrated: savedHydrated } = useSavedWorkoutsStore();
  const { hasHydrated: catalogHydrated } = useExerciseCatalogStore();
  const [refreshTick, setRefreshTick] = useState(0);

  const isContextLoading = !scheduleHydrated || !savedHydrated || !catalogHydrated;

  const context = useMemo(() => {
    if (isContextLoading) return null;
    return buildHeroContext({
      schedule,
      completedDates,
      workoutLogsByDate,
      savedWorkouts,
    });
  }, [isContextLoading, schedule, completedDates, workoutLogsByDate, savedWorkouts, refreshTick]);

  const refreshContext = useCallback(() => {
    setRefreshTick(current => current + 1);
  }, []);

  return {
    context,
    isContextLoading,
    refreshContext,
  };
}
