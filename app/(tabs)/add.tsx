import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { exercises as allExercises } from '@/data/exercises';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';

export default function AddScreen() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const { savedExercises, addWorkout } = useSavedWorkoutsStore();

  const MAX_EXERCISES = 12;

  const savedExerciseIds = useMemo(
    () => new Set(savedExercises.map(exercise => exercise.originalId)),
    [savedExercises]
  );

  const allExercisesWithoutSaved = useMemo(
    () => allExercises.filter(exercise => !savedExerciseIds.has(exercise.id)),
    [savedExerciseIds]
  );

  const selectedExerciseDetails = selectedExercises
    .map(id => allExercises.find(exercise => exercise.id === id))
    .filter(Boolean) as (typeof allExercises)[number][];

  const selectedExerciseSet = useMemo(
    () => new Set(selectedExercises),
    [selectedExercises]
  );

  const resetForm = () => {
    setWorkoutName('');
    setWorkoutDescription('');
    setSelectedExercises([]);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const closeAddFlow = () => {
    setCreateModalVisible(false);
    resetForm();
  };

  const handleSelectExercise = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      Alert.alert('Exercise already selected', 'This exercise is already in your list.');
      return;
    }

    if (selectedExercises.length >= MAX_EXERCISES) {
      Alert.alert('Limit reached', `You can only add up to ${MAX_EXERCISES} exercises per workout.`);
      return;
    }

    setSelectedExercises(prev => [...prev, exerciseId]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(id => id !== exerciseId));
  };

  const handleCreateWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Name required', 'Please add a name for your workout.');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Add exercises', 'Select at least one exercise to create a workout.');
      return;
    }

    const success = addWorkout({
      originalId: `custom-${Date.now()}`,
      name: workoutName.trim(),
      description: workoutDescription.trim(),
      exercises: selectedExercises,
    });

    if (success) {
      Alert.alert('Workout created', 'Your new workout has been saved.', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            setCreateModalVisible(false);
          },
        },
      ]);
    } else {
      Alert.alert('Unable to save', 'A workout with these settings already exists.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.launchWrapper}>
        <TouchableOpacity style={styles.launchButton} onPress={openCreateModal}>
          <Text style={styles.launchButtonText}>Create New Workout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAddFlow}>
        <View style={styles.centeredView}>
          <View style={styles.createModal}>
            <View style={styles.headerRow}>
              <View style={{ width: 48 }} />
              <Text style={styles.modalTitle}>Create New Workout</Text>
              <TouchableOpacity onPress={closeAddFlow} style={styles.backLink}>
                <Text style={styles.backText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bodyWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Workout Name"
                placeholderTextColor="#888"
                value={workoutName}
                onChangeText={setWorkoutName}
              />
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description (optional)"
                placeholderTextColor="#888"
                value={workoutDescription}
                onChangeText={setWorkoutDescription}
                multiline
              />

              <View style={styles.selectedContainer}>
                <Text style={styles.sectionLabel}>Selected Exercises</Text>
                {selectedExerciseDetails.length === 0 ? (
                  <Text style={styles.emptySelectionText}>No exercises yet. Tap one of the options below to add it.</Text>
                ) : (
                  <View style={styles.selectedWrap}>
                    {selectedExerciseDetails.map(exercise => (
                      <View key={exercise.id} style={styles.selectedChip}>
                        <Text style={styles.selectedText}>{exercise.name}</Text>
                        <TouchableOpacity onPress={() => handleRemoveExercise(exercise.id)} style={styles.removeButton}>
                          <Text style={styles.removeButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>Saved</Text>
                <ScrollView style={styles.exerciseList} nestedScrollEnabled>
                  {savedExercises.filter(exercise => !selectedExerciseSet.has(exercise.originalId)).length === 0 ? (
                    <Text style={styles.emptyText}>You haven’t saved any exercises yet.</Text>
                  ) : (
                    savedExercises
                      .filter(exercise => !selectedExerciseSet.has(exercise.originalId))
                      .map(exercise => (
                        <TouchableOpacity
                          key={exercise.id}
                          style={styles.exerciseRow}
                          onPress={() => handleSelectExercise(exercise.originalId)}>
                          <Text style={styles.exerciseText}>{exercise.name}</Text>
                          <Text style={styles.exerciseAdd}>+</Text>
                        </TouchableOpacity>
                      ))
                  )}
                </ScrollView>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>All Exercises</Text>
                <ScrollView style={styles.exerciseList} nestedScrollEnabled>
                  {allExercisesWithoutSaved
                    .filter(exercise => !selectedExerciseSet.has(exercise.id))
                    .map(exercise => (
                      <TouchableOpacity
                        key={exercise.id}
                        style={styles.exerciseRow}
                        onPress={() => handleSelectExercise(exercise.id)}>
                        <Text style={styles.exerciseText}>{exercise.name}</Text>
                        <Text style={styles.exerciseAdd}>+</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={closeAddFlow} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
                <Text style={styles.createText}>Save</Text>
              </TouchableOpacity>
            </View>
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
  },
  launchWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  launchButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  createModal: {
    width: '94%',
    maxHeight: '94%',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backLink: {
    padding: 4,
  },
  backText: {
    color: '#888',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  bodyWrapper: {
    flex: 1,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  descriptionInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  selectedContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'left',
  },
  emptySelectionText: {
    color: '#888',
    fontSize: 14,
  },
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedText: {
    color: '#fff',
  },
  removeButton: {
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#f66',
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 8,
  },
  exerciseText: {
    color: '#fff',
    fontSize: 14,
  },
  exerciseAdd: {
    color: '#0f0',
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseList: {
    maxHeight: 160,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 12,
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  createText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
