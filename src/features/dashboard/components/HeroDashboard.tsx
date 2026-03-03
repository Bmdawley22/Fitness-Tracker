import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { useTelemetry } from '../hooks/useTelemetry';
import { TelemetryCollector } from '../services/TelemetryCollector';
import { StreakBadgeWidget } from './widgets/StreakBadgeWidget';
import { SuggestedWorkoutWidget } from './widgets/SuggestedWorkoutWidget';
import { QuickLogWidget } from './widgets/QuickLogWidget';
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
  const { context, layout, loading } = useDashboardContext(getRecentWorkouts, hasWorkoutHistory);
  const { track } = useTelemetry();

  useEffect(() => {
    track('hero_dashboard_view', {});
  }, [track]);

  useEffect(() => {
    if (context) TelemetryCollector.getInstance().setContext(context);
  }, [context]);

  useEffect(() => {
    if (!layout) return;
    layout.widgets.forEach((widgetType, index) => {
      track('widget_rendered', { widgetType, widgetPosition: index });
    });
  }, [layout, track]);

  if (loading || !context || !layout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CD66F" />
      </View>
    );
  }

  const renderWidget = (widgetType: WidgetType, index: number) => {
    const delay = 200 * index;

    switch (widgetType) {
      case 'streak':
        return (
          <Animated.View key={`streak-${index}`} entering={FadeInDown.delay(delay).duration(450)}>
            <StreakBadgeWidget streakDays={context.patterns.streakDays} variant="active" />
          </Animated.View>
        );
      case 'suggested':
        return (
          <Animated.View key={`suggested-${index}`} entering={FadeInDown.delay(delay).duration(450)}>
            <SuggestedWorkoutWidget
              routineName={mostRecentRoutineName || 'Your Last Workout'}
              onStart={onStartWorkout}
            />
          </Animated.View>
        );
      case 'quickLog':
        return (
          <Animated.View key={`quickLog-${index}`} entering={FadeInDown.delay(delay).duration(450)}>
            <QuickLogWidget onTap={onLogWorkout} />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return <View style={styles.container}>{layout.widgets.map((widgetType, index) => renderWidget(widgetType, index))}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loadingContainer: {
    height: 120,
    backgroundColor: '#111',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
