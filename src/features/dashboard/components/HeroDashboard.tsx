// HeroDashboard.tsx - Context-aware adaptive dashboard

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { StreakBadgeWidget } from './widgets/StreakBadgeWidget';
import { SuggestedWorkoutWidget } from './widgets/SuggestedWorkoutWidget';
import { QuickLogWidget } from './widgets/QuickLogWidget';
import { Colors, ThemeTokens } from '@/constants/theme';
import type { WidgetType } from '../types/DashboardContext';

type WorkoutRecord = {
  timestamp: number;
};

type HeroDashboardProps = {
  getRecentWorkouts: (daysBack: number) => Promise<WorkoutRecord[]>;
  hasWorkoutHistory: boolean;
  mostRecentRoutineName?: string;
  onStartWorkout: () => void;
  onLogWorkout: () => void;
};

export function HeroDashboard({
  getRecentWorkouts,
  hasWorkoutHistory,
  mostRecentRoutineName,
  onStartWorkout,
  onLogWorkout,
}: HeroDashboardProps) {
  const { context, layout, loading } = useDashboardContext(
    getRecentWorkouts,
    hasWorkoutHistory
  );

  if (loading || !context || !layout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  const renderWidget = (widgetType: WidgetType, index: number) => {
    const delay = 200 * index; // Stagger animations

    switch (widgetType) {
      case 'streak':
        return (
          <Animated.View
            key={`streak-${index}`}
            entering={FadeInDown.delay(delay).duration(450)}>
            <StreakBadgeWidget
              streakDays={context.patterns.streakDays}
              variant="active"
            />
          </Animated.View>
        );

      case 'suggested':
        return (
          <Animated.View
            key={`suggested-${index}`}
            entering={FadeInDown.delay(delay).duration(450)}>
            <SuggestedWorkoutWidget
              routineName={mostRecentRoutineName || 'Your Last Workout'}
              onStart={onStartWorkout}
            />
          </Animated.View>
        );

      case 'quickLog':
        return (
          <Animated.View
            key={`quickLog-${index}`}
            entering={FadeInDown.delay(delay).duration(450)}>
            <QuickLogWidget onTap={onLogWorkout} />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {layout.widgets.map((widgetType, index) => renderWidget(widgetType, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: ThemeTokens.spacing.md,
  },
  loadingContainer: {
    height: 120,
    backgroundColor: Colors.dark.surfaceLift,
    borderRadius: ThemeTokens.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
