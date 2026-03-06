import type { ComponentType } from 'react';
import TodayScreen from './TodayScreen';

export type UseTodayWorkoutScreenResult = {
  Screen: ComponentType;
};

export function useTodayWorkoutScreen(): UseTodayWorkoutScreenResult {
  return { Screen: TodayScreen };
}
