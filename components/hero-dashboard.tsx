import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Colors, ThemeTokens } from '@/constants/theme';

export type HeroWorkoutInfo = {
  id: string;
  name: string;
  description: string;
  dateLabel: string;
  estimatedDuration: number;
};

type HeroDashboardProps = {
  streak: number;
  savedExercises: number;
  workout?: HeroWorkoutInfo;
  onStart: () => void;
};

export function HeroDashboard({ streak, savedExercises, workout, onStart }: HeroDashboardProps) {
  const disabled = !workout;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    translateY.value = withTiming(0, { duration: 450 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mission Control</Text>
        <Text style={styles.metricText}>{streak} day{streak === 1 ? '' : 's'} streak</Text>
      </View>
      <Text style={styles.subTitle}>Next target</Text>
      {workout ? (
        <View style={styles.workoutRow}>
          <View style={styles.workoutMeta}>
            <Text style={styles.workoutDate}>{workout.dateLabel}</Text>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.workoutDescription}>{workout.description}</Text>
            <Text style={styles.workoutDetail}>Est. {workout.estimatedDuration} min • {savedExercises} saved exercises</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Save a workout to fuel the flow.</Text>
          <Text style={styles.emptyHint}>We track reps, load, and tempo right here.</Text>
        </View>
      )}
      <Pressable
        onPress={onStart}
        disabled={disabled}
        style={({ pressed }) => [
          styles.cta,
          disabled && styles.ctaDisabled,
          pressed && !disabled ? styles.ctaPressed : null,
        ]}>
        <Text style={styles.ctaText}>{disabled ? 'Save a workout first' : 'Start the flow'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surfaceLift,
    borderRadius: ThemeTokens.radii.lg,
    padding: ThemeTokens.spacing.lg,
    marginBottom: ThemeTokens.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: ThemeTokens.spacing.sm,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 20,
    fontFamily: ThemeTokens.fonts.display,
  },
  metricText: {
    color: Colors.dark.accent,
    fontSize: 16,
    fontFamily: ThemeTokens.fonts.heading,
  },
  subTitle: {
    color: Colors.dark.mutedText,
    fontSize: 14,
    fontFamily: ThemeTokens.fonts.medium,
    marginBottom: ThemeTokens.spacing.xs,
  },
  workoutRow: {
    marginBottom: ThemeTokens.spacing.sm,
  },
  workoutMeta: {
    marginBottom: ThemeTokens.spacing.xs,
  },
  workoutDate: {
    color: Colors.dark.accentWarm,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: ThemeTokens.fonts.medium,
  },
  workoutName: {
    color: Colors.dark.text,
    fontSize: 22,
    fontFamily: ThemeTokens.fonts.heading,
  },
  workoutDescription: {
    color: Colors.dark.mutedText,
    fontSize: 15,
    fontFamily: ThemeTokens.fonts.body,
  },
  workoutDetail: {
    color: Colors.dark.accent,
    fontSize: 13,
    fontFamily: ThemeTokens.fonts.medium,
    marginTop: ThemeTokens.spacing.xs,
  },
  emptyState: {
    marginBottom: ThemeTokens.spacing.sm,
  },
  emptyText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: ThemeTokens.fonts.body,
  },
  emptyHint: {
    color: Colors.dark.mutedText,
    fontSize: 13,
    fontFamily: ThemeTokens.fonts.medium,
  },
  cta: {
    marginTop: ThemeTokens.spacing.md,
    borderRadius: ThemeTokens.radii.pill,
    paddingVertical: ThemeTokens.spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.dark.accent,
    shadowColor: Colors.dark.glow,
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  ctaDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    color: '#030409',
    fontFamily: ThemeTokens.fonts.medium,
    fontSize: 16,
  },
});
