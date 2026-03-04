import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTelemetry } from '../../hooks/useTelemetry';
import type { RoutineSignal } from '../../types/DashboardContext';

type SuggestedWorkoutWidgetProps = {
  routineName?: string;
  routineSignal?: RoutineSignal | null;
  onStart: () => void;
};

export function SuggestedWorkoutWidget({ routineName, routineSignal, onStart }: SuggestedWorkoutWidgetProps) {
  const { track } = useTelemetry();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.15);
  const resolvedName = routineSignal?.workoutName || routineName || 'Your Last Workout';

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const handleStart = () => {
    track('suggestion_accepted', { suggestionType: 'workout_plan', actionType: 'start_suggested' });
    onStart();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View pointerEvents="none" style={[styles.glowLayer, glowStyle]} />
      <View style={styles.content}>
        <Text style={styles.label}>Suggested</Text>
        <Text style={styles.routineName}>{resolvedName}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start suggested workout"
        hitSlop={8}
        onPress={handleStart}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 14, stiffness: 260 });
          glow.value = withTiming(0.35, { duration: 160 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
          glow.value = withTiming(0.15, { duration: 200 });
        }}
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}>
        <Text style={styles.ctaText}>Start Workout</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 120, backgroundColor: '#111', borderRadius: 14, borderWidth: 2, borderColor: '#333', padding: 16, justifyContent: 'space-between', overflow: 'hidden' },
  glowLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#2CD66F' },
  content: { gap: 4 },
  label: { fontSize: 12, color: '#9fa6af', textTransform: 'uppercase', letterSpacing: 0.5 },
  routineName: { fontSize: 18, color: '#fff', fontWeight: '700' },
  ctaButton: { backgroundColor: '#2CD66F', borderRadius: 999, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  ctaButtonPressed: { transform: [{ scale: 0.97 }] },
  ctaText: { fontSize: 14, color: '#030409', fontWeight: '700' },
});
