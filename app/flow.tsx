import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, ThemeTokens } from '@/constants/theme';
import { FlowToast } from '@/components/flow-toast';
import { useFlowStore } from '@/store/flow';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';
import { useExerciseCatalogStore } from '@/store/exerciseCatalog';
import { logTelemetry } from '@/lib/telemetry';

type ExerciseLike = {
  id: string;
  name: string;
  description?: string;
};

const AUTO_PROMPTS = [
  'Reset the breath before the next set.',
  'Track tension in the working muscle and let the rest come easy.',
  'Lean into tempo instead of speed—control every rep.',
  'Breathe out as you contract, breathe in as you release.',
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function FlowScreen() {
  const router = useRouter();
  const {
    activeWorkoutId,
    status,
    currentExerciseIndex,
    pauseFlow,
    resumeFlow,
    nextExercise,
    completeFlow,
    resetFlow,
  } = useFlowStore();

  const savedWorkouts = useSavedWorkoutsStore(state => state.savedWorkouts);
  const customExercises = useSavedWorkoutsStore(state => state.customExercises);
  const savedExercises = useSavedWorkoutsStore(state => state.savedExercises);
  const { seededExercises, hasHydrated: catalogHydrated } = useExerciseCatalogStore();

  const workout = useMemo(() => savedWorkouts.find(w => w.id === activeWorkoutId) ?? null, [activeWorkoutId, savedWorkouts]);
  const workoutExercises = workout?.exercises ?? [];
  const currentExerciseId = workoutExercises[currentExerciseIndex];

  const exerciseLookup = useMemo(() => {
    const map = new Map<string, ExerciseLike>();
    if (catalogHydrated) {
      seededExercises.forEach(exercise => {
        map.set(exercise.id, { id: exercise.id, name: exercise.name, description: exercise.description });
      });
    }
    customExercises.forEach(exercise => {
      map.set(exercise.id, { id: exercise.id, name: exercise.name, description: exercise.description });
    });
    savedExercises.forEach(exercise => {
      map.set(exercise.id, { id: exercise.id, name: exercise.name, description: exercise.description });
    });
    return map;
  }, [catalogHydrated, seededExercises, customExercises, savedExercises]);

  const currentExercise = currentExerciseId ? exerciseLookup.get(currentExerciseId) : null;
  const nextExerciseInfo = workoutExercises.length > currentExerciseIndex + 1
    ? exerciseLookup.get(workoutExercises[currentExerciseIndex + 1])
    : null;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    setElapsedSeconds(0);
  }, [activeWorkoutId]);

  useEffect(() => {
    if (status !== 'running') return undefined;
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef(status);

  useEffect(() => {
    if (status === 'completed' && statusRef.current !== 'completed') {
      setToastVisible(true);
      logTelemetry('flow_completion_toast', { workoutId: activeWorkoutId });
      toastTimerRef.current = setTimeout(() => setToastVisible(false), 3200);
    }
    if (status !== 'completed' && toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    statusRef.current = status;
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [status, activeWorkoutId]);

  const handlePauseResume = () => {
    if (status === 'running') {
      pauseFlow();
    } else if (status === 'paused') {
      resumeFlow();
    }
  };

  const handleNext = () => {
    if (!workout || workoutExercises.length === 0) return;
    nextExercise(workoutExercises.length);
  };

  const handleComplete = () => {
    if (!workout) return;
    completeFlow();
  };

  const handleExit = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  const promptMessage = nextExerciseInfo
    ? `Up next: ${nextExerciseInfo.name}`
    : 'Last move, bring it home.';
  const coachingHint = AUTO_PROMPTS[currentExerciseIndex % AUTO_PROMPTS.length];
  const statusLabel = status === 'paused' ? 'Paused' : status === 'running' ? 'In motion' : status === 'completed' ? 'Complete' : 'Ready';
  const toastMessage = workout ? `Flow complete — ${workout.name}!` : 'Flow complete!';

  return (
    <LinearGradient
      colors={[Colors.dark.background, Colors.dark.surfaceLift, Colors.dark.accent]}
      style={styles.gradient}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Flow mode</Text>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
        </View>

        {workout ? (
          <View style={styles.content}>
            <View style={styles.timerWrapper}>
              <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
              <Text style={styles.timerLabel}>{statusLabel}</Text>
            </View>

            <View style={styles.exerciseCard}>
              <Text style={styles.sectionLabel}>Current move</Text>
              <Text style={styles.exerciseName}>{currentExercise?.name ?? 'Warm up your focus'}</Text>
              {currentExercise?.description ? (
                <Text style={styles.exerciseDescription} numberOfLines={3}>
                  {currentExercise.description}
                </Text>
              ) : null}
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {Math.min(currentExerciseIndex + 1, workoutExercises.length)} / {workoutExercises.length}
                </Text>
                <Text style={styles.autoPrompt}>{promptMessage}</Text>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                onPress={handlePauseResume}
                style={styles.controlButton}
                activeOpacity={0.85}>
                <Text style={styles.controlText}>{status === 'running' ? 'Pause' : 'Resume'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                style={[styles.controlButton, styles.nextButton]}
                activeOpacity={0.85}
                disabled={status === 'completed' || workoutExercises.length === 0}>
                <Text style={styles.controlText}>Next</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleComplete}
              style={styles.finishButton}
              disabled={status === 'completed'}>
              <Text style={styles.finishText}>{status === 'completed' ? 'Flow complete' : 'Complete flow'}</Text>
            </TouchableOpacity>

            <Text style={styles.hintText}>{coachingHint}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active workout</Text>
            <Text style={styles.emptyCopy}>Start a workout from Home to launch Flow mode.</Text>
            <TouchableOpacity onPress={handleExit} style={styles.backButton}>
              <Text style={styles.backButtonText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
      <FlowToast visible={toastVisible} message={toastMessage} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ThemeTokens.spacing.md,
  },
  title: {
    fontFamily: ThemeTokens.fonts.heading,
    fontSize: 20,
    color: '#fff',
  },
  exitButton: {
    padding: ThemeTokens.spacing.sm,
  },
  exitText: {
    color: Colors.dark.mutedText,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: ThemeTokens.spacing.md,
    marginTop: ThemeTokens.spacing.md,
    justifyContent: 'space-between',
    paddingBottom: ThemeTokens.spacing.xl,
  },
  timerWrapper: {
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 64,
    fontFamily: ThemeTokens.fonts.display,
    color: '#fff',
  },
  timerLabel: {
    color: Colors.dark.mutedText,
    marginTop: ThemeTokens.spacing.xs,
  },
  exerciseCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: ThemeTokens.radii.lg,
    padding: ThemeTokens.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  sectionLabel: {
    color: Colors.dark.accentWarm,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: ThemeTokens.fonts.medium,
  },
  exerciseName: {
    fontSize: 28,
    fontFamily: ThemeTokens.fonts.display,
    color: '#fff',
    marginVertical: ThemeTokens.spacing.sm,
  },
  exerciseDescription: {
    color: Colors.dark.mutedText,
    fontFamily: ThemeTokens.fonts.body,
    fontSize: 14,
  },
  progressRow: {
    marginTop: ThemeTokens.spacing.lg,
  },
  progressText: {
    color: Colors.dark.accent,
    fontFamily: ThemeTokens.fonts.heading,
    fontSize: 16,
  },
  autoPrompt: {
    color: '#fff',
    fontFamily: ThemeTokens.fonts.medium,
    marginTop: ThemeTokens.spacing.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ThemeTokens.spacing.lg,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: ThemeTokens.spacing.xs,
    paddingVertical: ThemeTokens.spacing.sm,
    borderRadius: ThemeTokens.radii.pill,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
  },
  nextButton: {
    borderColor: Colors.dark.accent,
  },
  controlText: {
    color: '#fff',
    fontFamily: ThemeTokens.fonts.strong,
    fontSize: 16,
  },
  finishButton: {
    marginTop: ThemeTokens.spacing.sm,
    borderRadius: ThemeTokens.radii.pill,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    paddingVertical: ThemeTokens.spacing.sm,
  },
  finishText: {
    color: '#030409',
    fontFamily: ThemeTokens.fonts.strong,
    fontSize: 16,
  },
  hintText: {
    color: Colors.dark.mutedText,
    fontFamily: ThemeTokens.fonts.medium,
    fontSize: 13,
    textAlign: 'center',
    marginTop: ThemeTokens.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ThemeTokens.spacing.md,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: ThemeTokens.fonts.heading,
    marginBottom: ThemeTokens.spacing.xs,
  },
  emptyCopy: {
    color: Colors.dark.mutedText,
    textAlign: 'center',
    marginBottom: ThemeTokens.spacing.md,
  },
  backButton: {
    borderRadius: ThemeTokens.radii.pill,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
    paddingVertical: ThemeTokens.spacing.sm,
    paddingHorizontal: ThemeTokens.spacing.lg,
  },
  backButtonText: {
    color: Colors.dark.accent,
    fontFamily: ThemeTokens.fonts.medium,
  },
});
