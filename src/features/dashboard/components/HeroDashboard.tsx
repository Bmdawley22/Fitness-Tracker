import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { AdaptiveLayoutEngine, type AdaptiveLayout } from '../services/AdaptiveLayoutEngine';
import { useContextEngine } from '../hooks/useContextEngine';
import { useTelemetry } from '../hooks/useTelemetry';
import { useHeroQuickActions } from '../hooks/useHeroQuickActions';
import { TelemetryCollector } from '../services/TelemetryCollector';
import { StreakBadgeWidget } from './widgets/StreakBadgeWidget';
import { SuggestedWorkoutWidget } from './widgets/SuggestedWorkoutWidget';
import { QuickLogWidget } from './widgets/QuickLogWidget';
import { ArrowAffordance } from './ArrowAffordance';
import type { WidgetType } from '../types/DashboardContext';

type RouterLike = { push: (path: any) => void };

type HeroDashboardProps = {
  mostRecentRoutineName?: string;
  onStartWorkout: () => void;
  onLogWorkout: () => void;
  onResumeWorkout?: () => void;
  router: RouterLike;
};

type WidgetSlotProps = {
  index: number;
  contextKey: string;
  children: React.ReactNode;
};

function WidgetSlot({ index, contextKey, children }: WidgetSlotProps) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 12;
    opacity.value = withDelay(index * 70, withTiming(1, { duration: 280 }));
    translateY.value = withDelay(index * 70, withTiming(0, { duration: 280 }));
  }, [contextKey, index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function shouldHighlightPrimaryAction(layout: AdaptiveLayout | null): boolean {
  if (!layout) return false;
  return layout.primaryAction.actionId === 'start_suggested' || layout.primaryAction.highlight === true;
}

export function HeroDashboard({ mostRecentRoutineName, onStartWorkout, onLogWorkout, onResumeWorkout, router }: HeroDashboardProps) {
  const { context, isContextLoading, refreshContext } = useContextEngine();
  const { track } = useTelemetry();
  const trackedView = useRef(false);

  const layout = useMemo(() => (context ? AdaptiveLayoutEngine.buildLayout(context) : null), [context]);
  const contextId = useMemo(() => {
    if (!context) return 'none';
    return `${context.period}_${context.streakStatus}_${context.isRestDay ? 'rest' : 'active'}`;
  }, [context]);

  useEffect(() => {
    if (!context) return;
    TelemetryCollector.getInstance().setContext({
      timeSlot: context.period === 'day' ? 'midday' : context.period,
      patterns: {
        lastWorkoutTs: context.lastWorkoutAt ? Date.parse(context.lastWorkoutAt) : null,
        streakDays: context.streakStatus === 'healthy' ? 5 : context.streakStatus === 'atRisk' ? 3 : 0,
        daysSinceLastWorkout: context.lastWorkoutAt
          ? Math.max(0, Math.floor((Date.now() - Date.parse(context.lastWorkoutAt)) / (24 * 60 * 60 * 1000)))
          : Infinity,
      },
    });
  }, [context]);

  const { primaryLabel, secondaryLabel, handlePrimaryAction, handleSecondaryAction } = useHeroQuickActions({
    context,
    router,
    track,
    onLogWorkout,
    onStartWorkout,
    onResumeWorkout,
    refreshContext,
  });

  useEffect(() => {
    if (!context || isContextLoading || trackedView.current) return;
    track('hero_dashboard_view', { contextId });
    trackedView.current = true;
  }, [context, isContextLoading, contextId, track]);

  useEffect(() => {
    if (!layout || !context || isContextLoading) return;
    layout.widgets.forEach((widgetId, index) => {
      track('hero_widget_rendered', { widgetId, widgetPosition: index, contextId });
    });
  }, [layout, context, isContextLoading, contextId, track]);

  if (isContextLoading || !context || !layout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CD66F" />
        <View style={styles.skeletonCard} />
      </View>
    );
  }

  const renderWidget = (widgetType: WidgetType) => {
    if (widgetType === 'streak') {
      return <StreakBadgeWidget streakDays={context.streakStatus === 'broken' ? 0 : 3} streakStatus={context.streakStatus} />;
    }
    if (widgetType === 'suggested') {
      return <SuggestedWorkoutWidget routineName={mostRecentRoutineName} routineSignal={context.routineSignal} onStart={onStartWorkout} />;
    }
    return <QuickLogWidget onTap={onLogWorkout} label={layout.primaryAction.actionId === 'log_workout' ? 'Log workout now' : '+ Log Workout'} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{layout.subtitle}</Text>
      <View style={styles.primaryWidgetRow}>
        {layout.widgets.map((widgetType, index) => (
          <WidgetSlot key={`${widgetType}-${index}`} index={index} contextKey={contextId}>
            {renderWidget(widgetType)}
          </WidgetSlot>
        ))}
      </View>
      <View style={styles.quickActionsRow}>
        <ArrowAffordance
          label={primaryLabel}
          onPress={handlePrimaryAction}
          style={styles.primaryAction}
          highlight={shouldHighlightPrimaryAction(layout)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={secondaryLabel}
          hitSlop={8}
          android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          onPress={handleSecondaryAction}
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.secondaryActionPressed]}>
          <Text style={styles.secondaryActionText}>{secondaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#111', borderRadius: 14, padding: 14, gap: 12 },
  subtitle: { color: '#c4ccd4', fontSize: 13, fontWeight: '600' },
  primaryWidgetRow: { gap: 12 },
  quickActionsRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryAction: { flex: 1 },
  secondaryAction: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', backgroundColor: '#161616', paddingVertical: 12, alignItems: 'center' },
  secondaryActionPressed: { transform: [{ scale: 0.97 }] },
  secondaryActionText: { color: '#d0d6dd', fontSize: 13, fontWeight: '700' },
  loadingContainer: { minHeight: 160, backgroundColor: '#111', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 },
  skeletonCard: { width: '100%', height: 56, borderRadius: 12, backgroundColor: '#1a1a1a' },
});
