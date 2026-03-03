// SuggestedWorkoutWidget.tsx - Suggest most recent workout routine

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, ThemeTokens } from '@/constants/theme';
import { useTelemetry } from '../../hooks/useTelemetry';

type SuggestedWorkoutWidgetProps = {
  routineName: string;
  onStart: () => void;
};

export function SuggestedWorkoutWidget({ routineName, onStart }: SuggestedWorkoutWidgetProps) {
  const { track } = useTelemetry();

  const handleStart = () => {
    track('suggestion_accepted', {
      suggestionType: 'workout_plan',
      actionType: 'start_suggested',
    });
    onStart();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Resume:</Text>
        <Text style={styles.routineName}>{routineName}</Text>
      </View>
      <Pressable
        onPress={handleStart}
        style={({ pressed }) => [
          styles.ctaButton,
          pressed && styles.ctaButtonPressed,
        ]}>
        <Text style={styles.ctaText}>Start Workout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    backgroundColor: Colors.dark.surfaceLift,
    borderRadius: ThemeTokens.radii.lg,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    padding: ThemeTokens.spacing.md,
    justifyContent: 'space-between',
  },
  content: {
    gap: ThemeTokens.spacing.xs,
  },
  label: {
    fontSize: 12,
    fontFamily: ThemeTokens.fonts.medium,
    color: Colors.dark.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routineName: {
    fontSize: 18,
    fontFamily: ThemeTokens.fonts.heading,
    color: Colors.dark.text,
    fontWeight: '700',
  },
  ctaButton: {
    backgroundColor: Colors.dark.accent,
    borderRadius: ThemeTokens.radii.pill,
    paddingVertical: ThemeTokens.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.glow,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  ctaText: {
    fontSize: 14,
    fontFamily: ThemeTokens.fonts.medium,
    color: '#030409',
    fontWeight: '700',
  },
});
