import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
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
  const hasTrackedHeroView = useRef(false);
  const glowPulse = useSharedValue(0);

  const glowPulseStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }));

  useEffect(() => {
    if (!context) return;

    TelemetryCollector.getInstance().setContext(context);
  }, [context]);

  useEffect(() => {
    if (!context || loading || hasTrackedHeroView.current) {
      return;
    }

    track('hero_dashboard_view', {});
    hasTrackedHeroView.current = true;
  }, [context, loading, track]);

  useEffect(() => {
    if (!layout) return;
    layout.widgets.forEach((widgetType, index) => {
      track('widget_rendered', { widgetType, widgetPosition: index });
    });

    glowPulse.value = withTiming(0.2, { duration: 200 });
    glowPulse.value = withDelay(220, withTiming(0, { duration: 400 }));
  }, [layout, track, glowPulse]);

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

  return (
    <View style={styles.container}>
      <Animated.View pointerEvents="none" style={[styles.heroGlowPulse, glowPulseStyle]} />
      {layout.widgets.map((widgetType, index) => renderWidget(widgetType, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    position: 'relative',
  },
  heroGlowPulse: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2CD66F',
    borderRadius: 14,
  },
  loadingContainer: {
    height: 120,
    backgroundColor: '#111',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
