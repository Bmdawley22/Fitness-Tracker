import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}>
        <Text style={styles.ctaText}>Start Workout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    padding: 16,
    justifyContent: 'space-between',
  },
  content: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routineName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  ctaButton: {
    backgroundColor: '#2CD66F',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  ctaText: {
    fontSize: 14,
    color: '#030409',
    fontWeight: '700',
  },
});
