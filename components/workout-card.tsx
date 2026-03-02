import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemeTokens, Colors } from '@/constants/theme';
import { SavedWorkout } from '@/store/savedWorkouts';

export type WorkoutCardMetadata = {
  muscleBadges: string[];
  equipment: string[];
  intensityLabel: string;
  difficultyLabel: string;
  estimatedDuration: number;
  exercisesCount: number;
};

type WorkoutCardProps = {
  workout: SavedWorkout;
  metadata: WorkoutCardMetadata;
  onStart: () => void;
  onPress?: () => void;
  index: number;
};

export function WorkoutCard({ workout, metadata, onStart, onPress, index }: WorkoutCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(34);

  useEffect(() => {
    opacity.value = withDelay(index * 90, withTiming(1, { duration: 420 }));
    translateY.value = withDelay(index * 90, withTiming(0, { duration: 420 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed ? styles.cardPressed : null,
        ]}
        onPress={onPress}
        android_ripple={{ color: '#ffffff0a' }}>
        <View style={styles.topRow}>
          <View style={styles.headingRow}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.workoutSubtitle}>{metadata.exercisesCount} exercises</Text>
          </View>
          <Pressable
            onPress={onStart}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}>
            <Text style={styles.startButtonText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>{workout.description}</Text>
        <View style={styles.badgeRow}>
          {metadata.muscleBadges.map(badge => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaPill}>{metadata.difficultyLabel}</Text>
          <Text style={styles.metaPill}>{metadata.intensityLabel}</Text>
          <Text style={styles.metaPill}>{metadata.estimatedDuration} min</Text>
        </View>
        <View style={styles.equipmentRow}>
          <Text style={styles.equipmentText}>{metadata.equipment.join(' • ')}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: ThemeTokens.radii.md,
    padding: ThemeTokens.spacing.md,
    marginBottom: ThemeTokens.spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cardPressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ThemeTokens.spacing.sm,
  },
  headingRow: {
    flex: 1,
  },
  workoutName: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: ThemeTokens.fonts.heading,
  },
  workoutSubtitle: {
    color: Colors.dark.mutedText,
    fontSize: 12,
    fontFamily: ThemeTokens.fonts.medium,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  startButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.accent,
    shadowColor: Colors.dark.glow,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  startButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  startButtonText: {
    color: '#000',
    fontSize: 28,
    fontFamily: ThemeTokens.fonts.display,
    lineHeight: 32,
  },
  description: {
    color: Colors.dark.mutedText,
    fontFamily: ThemeTokens.fonts.body,
    fontSize: 14,
    marginBottom: ThemeTokens.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: ThemeTokens.spacing.sm,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: ThemeTokens.radii.pill,
    backgroundColor: '#ffffff10',
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: Colors.dark.accent,
    fontSize: 12,
    fontFamily: ThemeTokens.fonts.medium,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: ThemeTokens.spacing.sm,
  },
  metaPill: {
    color: Colors.dark.text,
    fontSize: 12,
    fontFamily: ThemeTokens.fonts.medium,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: ThemeTokens.radii.sm,
    backgroundColor: '#20243b',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginRight: 6,
    marginBottom: 6,
  },
  equipmentRow: {
    borderTopWidth: 1,
    borderTopColor: '#1c1f2d',
    paddingTop: ThemeTokens.spacing.sm,
  },
  equipmentText: {
    color: Colors.dark.mutedText,
    fontSize: 12,
    fontFamily: ThemeTokens.fonts.body,
  },
});
