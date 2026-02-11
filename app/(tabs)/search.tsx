import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import React, { useMemo, useState } from 'react';
import { workouts } from '@/data/workouts';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

type WeekDay = (typeof WEEK_DAYS)[number];

type ScheduleState = Record<WeekDay, string | null>;

export default function SearchScreen() {
  const { savedWorkouts } = useSavedWorkoutsStore();
  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);
  const [schedule, setSchedule] = useState<ScheduleState>({
    Sunday: null,
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
  });

  const workoutOptions = useMemo(() => {
    const savedNames = savedWorkouts.map(workout => workout.name);
    const fallbackNames = workouts.map(workout => workout.name).filter(name => !savedNames.includes(name));
    return [...savedNames, ...fallbackNames];
  }, [savedWorkouts]);

  const handleAssignWorkout = (workoutName: string) => {
    if (!selectedDay) return;

    setSchedule(prev => ({
      ...prev,
      [selectedDay]: workoutName,
    }));
    setSelectedDay(null);
  };

  const handleClearDay = () => {
    if (!selectedDay) return;

    setSchedule(prev => ({
      ...prev,
      [selectedDay]: null,
    }));
    setSelectedDay(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Schedule</Text>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {WEEK_DAYS.map(day => (
          <View key={day} style={styles.dayRow}>
            <Text style={styles.dayTitle}>{day}</Text>
            <TouchableOpacity style={styles.assignButton} onPress={() => setSelectedDay(day)}>
              <Text style={styles.assignButtonLabel}>
                {schedule[day] ? schedule[day] : 'Tap to assign workout'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={selectedDay !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeX} onPress={() => setSelectedDay(null)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Assign Workout</Text>
            <Text style={styles.modalSubtitle}>{selectedDay}</Text>

            <ScrollView style={styles.workoutList}>
              {workoutOptions.map(workoutName => (
                <TouchableOpacity
                  key={workoutName}
                  style={styles.workoutOption}
                  onPress={() => handleAssignWorkout(workoutName)}>
                  <Text style={styles.workoutOptionText}>{workoutName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.clearButton} onPress={handleClearDay}>
              <Text style={styles.clearButtonText}>Clear Day</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedDay(null)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  dayRow: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  dayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  assignButton: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#111',
  },
  assignButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '75%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
  },
  closeX: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeXText: {
    color: '#888',
    fontSize: 20,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  modalSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  workoutList: {
    maxHeight: 280,
    marginBottom: 12,
  },
  workoutOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  workoutOptionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
