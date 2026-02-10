import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { exercises as allExercises } from '@/data/exercises';
import { useSavedWorkoutsStore, CustomExercise } from '@/store/savedWorkouts';

const WINDOW_HEIGHT = Dimensions.get('window').height;

export type SelectableExercise = (typeof allExercises)[number] | CustomExercise;

export default function AddScreen() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [createExerciseModalVisible, setCreateExerciseModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState('');
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [workoutDropdownVisible, setWorkoutDropdownVisible] = useState(false);
  const [selectedWorkoutForExercise, setSelectedWorkoutForExercise] = useState<string | null>(null);
  const [addToSavedExercises, setAddToSavedExercises] = useState(true);
  const {
    savedExercises,
    savedWorkouts,
    customExercises,
    addWorkout,
    addCustomExercise,
    addExercise,
    addExerciseToWorkout,
  } = useSavedWorkoutsStore();

  const MAX_EXERCISES = 12;
  const categoryOptions = ['Core', 'Chest', 'Shoulders', 'Biceps', 'Triceps', 'Back', 'Legs', 'Abs'];

  const savedExerciseIds = useMemo(
    () => new Set(savedExercises.map(exercise => exercise.originalId)),
    [savedExercises]
  );

  const allSelectableExercises = useMemo(
    () => [...allExercises, ...customExercises],
    [customExercises]
  );

  const allExercisesWithoutSaved = useMemo(
    () => allSelectableExercises.filter(exercise => !savedExerciseIds.has(exercise.id)),
    [allSelectableExercises, savedExerciseIds]
  );

  const selectedExerciseDetails = selectedExercises
    .map(id => allSelectableExercises.find(exercise => exercise.id === id))
    .filter(Boolean) as SelectableExercise[];

  const selectedExerciseSet = useMemo(
    () => new Set(selectedExercises),
    [selectedExercises]
  );

  const selectedWorkoutName = selectedWorkoutForExercise
    ? savedWorkouts.find(workout => workout.id === selectedWorkoutForExercise)?.name || ''
    : '';

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredSavedExercises = useMemo(() => {
    const base = savedExercises.filter(exercise => !selectedExerciseSet.has(exercise.originalId));
    if (!normalizedSearch) return base;
    return base.filter(exercise =>
      `${exercise.name} ${exercise.category}`.toLowerCase().includes(normalizedSearch)
    );
  }, [savedExercises, selectedExerciseSet, normalizedSearch]);

  const filteredAllExercises = useMemo(() => {
    const base = allExercisesWithoutSaved.filter(exercise => !selectedExerciseSet.has(exercise.id));
    if (!normalizedSearch) return base;
    return base.filter(exercise =>
      `${exercise.name} ${exercise.category}`.toLowerCase().includes(normalizedSearch)
    );
  }, [allExercisesWithoutSaved, selectedExerciseSet, normalizedSearch]);

  const toTitleCase = (value: string) =>
    value
      .split(' ')
      .map(word => (word ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : ''))
      .filter(Boolean)
      .join(' ');

  const resetForm = () => {
    setWorkoutName('');
    setWorkoutDescription('');
    setSelectedExercises([]);
    setSearchText('');
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const closeAddFlow = () => {
    setCreateModalVisible(false);
    resetForm();
  };

  const resetCreateExerciseForm = () => {
    setExerciseName('');
    setExerciseDescription('');
    setExerciseCategory('');
    setAddToSavedExercises(true);
    setSelectedWorkoutForExercise(null);
    setCategoryDropdownVisible(false);
    setWorkoutDropdownVisible(false);
  };

  const openCreateExerciseModal = () => {
    resetCreateExerciseForm();
    setCreateExerciseModalVisible(true);
  };

  const closeCreateExerciseModal = () => {
    setCreateExerciseModalVisible(false);
    resetCreateExerciseForm();
  };

  const handleCreateExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert('Name required', 'Please add a name for your exercise.');
      return;
    }

    if (!exerciseCategory) {
      Alert.alert('Category required', 'Select a category for the exercise.');
      return;
    }

    const newExercise = addCustomExercise({
      name: exerciseName.trim(),
      description: exerciseDescription.trim(),
      category: exerciseCategory,
    });

    const savedAdded = addToSavedExercises
      ? addExercise({
          originalId: newExercise.id,
          name: newExercise.name,
          description: newExercise.description,
          category: newExercise.category,
        })
      : false;

    let workoutAdded = false;
    let workoutName = '';
    if (selectedWorkoutForExercise) {
      const workout = savedWorkouts.find(w => w.id === selectedWorkoutForExercise);
      if (workout) {
        const success = addExerciseToWorkout(workout.id, newExercise.id);
        if (!success) {
          Alert.alert(
            `Could not add to ${workout.name}`,
            'This workout already contains that exercise or is full.'
          );
          return;
        }
        workoutAdded = true;
        workoutName = workout.name;
      }
    }

    const message = savedAdded
      ? workoutAdded
        ? `Exercise saved and added to ${workoutName}`
        : 'Exercise added and saved!'
      : workoutAdded
        ? `Exercise added to ${workoutName}`
        : 'Exercise added!';

    Alert.alert('Exercise added', message, [
      {
        text: 'OK',
        onPress: closeCreateExerciseModal,
      },
    ]);
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
    const trimmedName = workoutName.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please add a name for your workout.');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Add exercises', 'Select at least one exercise to create a workout.');
      return;
    }

    const success = addWorkout({
      originalId: `custom-${Date.now()}`,
      name: toTitleCase(trimmedName),
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
        <TouchableOpacity
          style={[styles.launchButton, styles.launchButtonSecondary]}
          onPress={openCreateExerciseModal}>
          <Text style={styles.launchButtonText}>Create New Exercise</Text>
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
              <TouchableOpacity onPress={closeAddFlow} style={styles.topCloseButton}>
                <Text style={styles.topCloseText}>Close</Text>
              </TouchableOpacity>
              <View style={styles.titleRow}>
                <Text style={styles.modalTitle}>Create New Workout</Text>
              </View>
              <TouchableOpacity style={styles.topSaveButton} onPress={handleCreateWorkout}>
                <Text style={styles.topSaveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputsContainer}>
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
                numberOfLines={2}
                scrollEnabled
              />
              <TextInput
                style={[styles.input, styles.searchInput]}
                placeholder="Search exercises by name or category"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
            </View>

            <View style={styles.selectedContainer}>
              <Text style={styles.sectionLabel}>Selected Exercises</Text>
              {selectedExerciseDetails.length === 0 ? (
                <Text style={styles.emptySelectionText}>No exercises yet. Tap one of the lists below to add it.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedWrap}>
                  {selectedExerciseDetails.map(exercise => (
                    <View key={exercise.id} style={styles.selectedChip}>
                      <Text style={styles.selectedText}>{exercise.name}</Text>
                      <TouchableOpacity onPress={() => handleRemoveExercise(exercise.id)} style={styles.removeButton}>
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Saved</Text>
              <ScrollView style={styles.exerciseList} nestedScrollEnabled>
                {filteredSavedExercises.length === 0 ? (
                  <Text style={styles.emptyText}>No saved exercises left.</Text>
                ) : (
                  filteredSavedExercises.map(exercise => (
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
                {filteredAllExercises.length === 0 ? (
                  <Text style={styles.emptyText}>No exercises found.</Text>
                ) : (
                  filteredAllExercises.map(exercise => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseRow}
                      onPress={() => handleSelectExercise(exercise.id)}>
                      <Text style={styles.exerciseText}>{exercise.name}</Text>
                      <Text style={styles.exerciseAdd}>+</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

          </View>
        </View>
      </Modal>
      <Modal
        visible={createExerciseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCreateExerciseModal}>
        <View style={styles.centeredView}>
          <View style={styles.createModal}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={closeCreateExerciseModal} style={styles.topCloseButton}>
                <Text style={styles.topCloseText}>Close</Text>
              </TouchableOpacity>
              <View style={styles.titleRow}>
                <Text style={[styles.modalTitle, styles.exerciseModalTitle]}>Create New Exercise</Text>
              </View>
              <TouchableOpacity style={styles.topSaveButton} onPress={handleCreateExercise}>
                <Text style={styles.topSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.exerciseModalBody}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled">
              <TextInput
                style={styles.input}
                placeholder="Exercise Name"
                placeholderTextColor="#888"
                value={exerciseName}
                onChangeText={setExerciseName}
              />
              <TextInput
                style={[styles.input, styles.exerciseDescriptionInput]}
                placeholder="Exercise Description (optional)"
                placeholderTextColor="#888"
                value={exerciseDescription}
                onChangeText={setExerciseDescription}
                multiline
              />
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownToggle}
                  onPress={() => {
                    setCategoryDropdownVisible(prev => !prev);
                    setWorkoutDropdownVisible(false);
                  }}>
                  <Text style={[styles.dropdownText, !exerciseCategory && styles.dropdownPlaceholder]}>
                    {exerciseCategory || 'Select a category'}
                  </Text>
                </TouchableOpacity>
                {categoryDropdownVisible && (
                  <View style={styles.dropdownList}>
                    {categoryOptions.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setExerciseCategory(option);
                          setCategoryDropdownVisible(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Add to Existing Workout</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownToggle}
                  onPress={() => {
                    setWorkoutDropdownVisible(prev => !prev);
                    setCategoryDropdownVisible(false);
                  }}>
                  <Text style={[styles.dropdownText, !selectedWorkoutForExercise && styles.dropdownPlaceholder]}>
                    {selectedWorkoutName || 'Optional - select a workout'}
                  </Text>
                </TouchableOpacity>
                {workoutDropdownVisible && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedWorkoutForExercise(null);
                        setWorkoutDropdownVisible(false);
                      }}>
                      <Text style={styles.dropdownItemText}>None</Text>
                    </TouchableOpacity>
                    {savedWorkouts.length === 0 ? (
                      <Text style={styles.dropdownEmptyText}>No saved workouts yet</Text>
                    ) : (
                      savedWorkouts.map(workout => (
                        <TouchableOpacity
                          key={workout.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedWorkoutForExercise(workout.id);
                            setWorkoutDropdownVisible(false);
                          }}>
                          <Text style={styles.dropdownItemText}>{workout.name}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAddToSavedExercises(prev => !prev)}>
                <Text style={styles.checkboxIcon}>{addToSavedExercises ? '☑' : '☐'}</Text>
                <Text style={styles.checkboxLabel}>Add to Saved Exercises</Text>
              </TouchableOpacity>
            </ScrollView>
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
    minHeight: WINDOW_HEIGHT * 0.75,
    maxHeight: WINDOW_HEIGHT * 0.92,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  inputsContainer: {
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
    height: 52,
    maxHeight: 52,
    textAlignVertical: 'top',
  },
  searchInput: {
    marginTop: 0,
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
  topSaveButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  topSaveText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  titleRow: {
    flex: 1,
    alignItems: 'center',
  },
  topCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  topCloseText: {
    color: '#fff',
    fontSize: 14,
  },
  launchButtonSecondary: {
    marginTop: 12,
    backgroundColor: '#fff',
  },
  exerciseModalTitle: {
    textAlign: 'center',
  },
  exerciseModalBody: {
    maxHeight: WINDOW_HEIGHT * 0.55,
  },
  exerciseDescriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownToggle: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownText: {
    color: '#fff',
  },
  dropdownPlaceholder: {
    color: '#777',
  },
  dropdownList: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    color: '#fff',
  },
  dropdownEmptyText: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#555',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 18,
    marginRight: 12,
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 14,
  },
});
