import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { exercises as allExercises } from '@/data/exercises';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';

export default function AddScreen() {
  const [menuVisible, setMenuVisible] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const { savedExercises, addWorkout } = useSavedWorkoutsStore();

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

  const openCreateModal = () => {
    setMenuVisible(false);
    setCreateModalVisible(true);
  };

  const backToMenu = () => {
    setCreateModalVisible(false);
    setMenuVisible(true);
  };

  const resetForm = () => {
    setWorkoutName('');
    setWorkoutDescription('');
    setSelectedExercises([]);
  };

  const closeAddFlow = () => {
    setCreateModalVisible(false);
    setMenuVisible(false);
    resetForm();
  };

  const handleSelectExercise = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      Alert.alert('Exercise already selected', 'This exercise is already in your list.');
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
      setMenuVisible(false);
    } else {
      Alert.alert('Unable to save', 'A workout with these settings already exists.');
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.menuModal}>
            <Text style={styles.menuTitle}>Create</Text>
            <TouchableOpacity style={styles.menuButton} onPress={openCreateModal}>
              <Text style={styles.menuButtonText}>Add New Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, styles.menuButtonClose]} onPress={() => setMenuVisible(false)}>
              <Text style={[styles.menuButtonText, styles.menuButtonCloseText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={backToMenu}>
        <View style={styles.centeredView}> 
          <View style={styles.createModal}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={backToMenu} style={styles.backLink}>
                <Text style={styles.backText}>← Menu</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create New Workout</Text>
              <View style={{ width: 48 }} />
            </View>

            <ScrollView
              style={styles.createBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.createScrollContent}>
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
                {savedExercises.length === 0 ? (
                  <Text style={styles.emptyText}>You haven’t saved any exercises yet.</Text>
                ) : (
                  savedExercises.map(exercise => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseRow}
                      onPress={() => handleSelectExercise(exercise.originalId)}>
                      <Text style={styles.exerciseText}>{exercise.name}</Text>
                      <Text style={styles.exerciseAdd}>+</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>All Exercises</Text>
                {allExercisesWithoutSaved.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseRow}
                    onPress={() => handleSelectExercise(exercise.id)}>
                    <Text style={styles.exerciseText}>{exercise.name}</Text>
                    <Text style={styles.exerciseAdd}>+</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={closeAddFlow} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
                <Text style={styles.createText}>Create</Text>
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  menuModal: {
    width: 280,
    padding: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  menuButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  menuButtonClose: {
    backgroundColor: '#333',
  },
  menuButtonCloseText: {
    color: '#fff',
  },
  createModal: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
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
  createBody: {
    marginBottom: 16,
  },
  createScrollContent: {
    paddingBottom: 16,
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
    fontSize: 16,
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
    fontSize: 16,
  },
  exerciseAdd: {
    color: '#0f0',
    fontSize: 20,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
