import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useExerciseCatalogStore } from '@/store/exerciseCatalog';
import { useSavedWorkoutsStore, CustomExercise } from '@/store/savedWorkouts';
import { ExerciseLogEntry, toLocalDateKey, useScheduleStore, WEEK_DAYS } from '@/store/schedule';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const DEFAULT_SET_COUNT = 3;
const MIN_SET_COUNT = 1;
const MAX_SET_COUNT = 6;
const DEFAULT_REPS = 6;
const REP_OPTIONS = Array.from({ length: 15 }, (_, index) => (index + 1) * 2);
const WEIGHT_OPTIONS = Array.from({ length: 100 }, (_, index) => (index + 1) * 5);

type ExerciseSetDraft = { reps: string; weight: string };

type ExerciseLike = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipment?: string;
  instructions?: string;
};

const resolveMuscleGroups = (exercise: ExerciseLike): string[] => {
  const primary = Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles.filter(Boolean) : [];
  if (primary.length > 0) return primary;
  if (exercise.category) return [exercise.category];
  return ['Other'];
};

export type SelectableExercise = ExerciseLike | CustomExercise;

export type CreateFlowHandle = {
  openCreateWorkout: () => void;
  openCreateExercise: () => void;
};

export const CreateFlowModals = forwardRef<CreateFlowHandle>(function CreateFlowModals(_, ref) {
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
  const { seededExercises, hasHydrated: catalogHydrated, runSeedIfNeeded } = useExerciseCatalogStore();

  useEffect(() => {
    if (catalogHydrated) {
      runSeedIfNeeded();
    }
  }, [catalogHydrated, runSeedIfNeeded]);

  const availableSeededExercises = useMemo(() => (catalogHydrated ? seededExercises : []), [catalogHydrated, seededExercises]);

  const MAX_EXERCISES = 12;
  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    availableSeededExercises.forEach(exercise => {
      resolveMuscleGroups(exercise).forEach(group => unique.add(group));
    });
    customExercises.forEach(exercise => {
      resolveMuscleGroups(exercise).forEach(group => unique.add(group));
    });
    const groups = Array.from(unique);
    groups.sort((a, b) => a.localeCompare(b));
    return groups.length ? groups : ['Other'];
  }, [availableSeededExercises, customExercises]);

  const savedExerciseIds = useMemo(
    () => new Set(savedExercises.map(exercise => exercise.originalId)),
    [savedExercises],
  );

  const allSelectableExercises = useMemo(
    () => [...availableSeededExercises, ...customExercises],
    [availableSeededExercises, customExercises],
  );

  const allExercisesWithoutSaved = useMemo(
    () => allSelectableExercises.filter(exercise => !savedExerciseIds.has(exercise.id)),
    [allSelectableExercises, savedExerciseIds],
  );

  const selectedExerciseDetails = selectedExercises
    .map(id => allSelectableExercises.find(exercise => exercise.id === id))
    .filter(Boolean) as SelectableExercise[];

  const selectedExerciseSet = useMemo(() => new Set(selectedExercises), [selectedExercises]);

  const selectedWorkoutName = selectedWorkoutForExercise
    ? savedWorkouts.find(workout => workout.id === selectedWorkoutForExercise)?.name || ''
    : '';

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredSavedExercises = useMemo(() => {
    const base = savedExercises.filter(exercise => !selectedExerciseSet.has(exercise.originalId));
    if (!normalizedSearch) return base;
    return base.filter(exercise => {
      const muscles = resolveMuscleGroups(exercise).join(' ');
      return `${exercise.name} ${muscles}`.toLowerCase().includes(normalizedSearch);
    });
  }, [savedExercises, selectedExerciseSet, normalizedSearch]);

  const filteredAllExercises = useMemo(() => {
    const base = allExercisesWithoutSaved.filter(exercise => !selectedExerciseSet.has(exercise.id));
    if (!normalizedSearch) return base;
    return base.filter(exercise => {
      const muscles = resolveMuscleGroups(exercise).join(' ');
      return `${exercise.name} ${muscles}`.toLowerCase().includes(normalizedSearch);
    });
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

  const openCreateWorkoutModal = () => {
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

  useImperativeHandle(ref, () => ({
    openCreateWorkout: openCreateWorkoutModal,
    openCreateExercise: openCreateExerciseModal,
  }));

  const handleCreateExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert('Name required', 'Please add a name for your exercise.');
      return;
    }

    if (!exerciseCategory) {
      Alert.alert('Muscle group required', 'Select a primary muscle group for the exercise.');
      return;
    }

    const newExercise = addCustomExercise({
      name: exerciseName.trim(),
      description: exerciseDescription.trim(),
      category: exerciseCategory,
      primaryMuscles: exerciseCategory ? [exerciseCategory] : [],
      secondaryMuscles: [],
    });

    const savedAdded = addToSavedExercises
      ? addExercise({
          originalId: newExercise.id,
          name: newExercise.name,
          description: newExercise.description,
          category: newExercise.category,
          primaryMuscles: newExercise.primaryMuscles,
          secondaryMuscles: newExercise.secondaryMuscles,
          equipment: newExercise.equipment,
          instructions: newExercise.instructions,
          image: newExercise.image,
        })
      : false;

    let workoutAdded = false;
    let workoutName = '';
    if (selectedWorkoutForExercise) {
      const workout = savedWorkouts.find(w => w.id === selectedWorkoutForExercise);
      if (workout) {
        const success = addExerciseToWorkout(workout.id, newExercise.id);
        if (!success) {
          Alert.alert(`Could not add to ${workout.name}`, 'This workout already contains that exercise or is full.');
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
          onPress: closeAddFlow,
        },
      ]);
    } else {
      Alert.alert('Unable to save', 'A workout with these settings already exists.');
    }
  };

  return (
    <>
      <Modal visible={createModalVisible} transparent animationType="slide" onRequestClose={closeAddFlow}>
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
                placeholder="Search exercises by name or muscle group"
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedWrap}>
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
                    <TouchableOpacity key={exercise.id} style={styles.exerciseRow} onPress={() => handleSelectExercise(exercise.originalId)}>
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
                    <TouchableOpacity key={exercise.id} style={styles.exerciseRow} onPress={() => handleSelectExercise(exercise.id)}>
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
              <Text style={styles.sectionLabel}>Primary Muscle Group</Text>
              <View style={[styles.dropdownContainer, categoryDropdownVisible && { zIndex: 20 }]}>
                <TouchableOpacity
                  style={styles.dropdownToggle}
                  onPress={() => {
                    setCategoryDropdownVisible(prev => !prev);
                    setWorkoutDropdownVisible(false);
                  }}>
                  <Text style={[styles.dropdownText, !exerciseCategory && styles.dropdownPlaceholder]}>
                    {exerciseCategory || 'Select a muscle group'}
                  </Text>
                </TouchableOpacity>
                {categoryDropdownVisible && (
                  <View style={styles.dropdownList}>
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
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
                    </ScrollView>
                  </View>
                )}
              </View>
              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Add to Existing Workout</Text>
              <View style={[styles.dropdownContainer, workoutDropdownVisible && { zIndex: 20 }]}>
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
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
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
                    </ScrollView>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAddToSavedExercises(prev => !prev)}>
                <Text style={styles.checkboxIcon}>{addToSavedExercises ? '☑' : '☐'}</Text>
                <Text style={styles.checkboxLabel}>Add to Saved Exercises</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
});

export default function AddScreen() {
  const [workoutSelectorVisible, setWorkoutSelectorVisible] = useState(false);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});
  const [exerciseLogVisible, setExerciseLogVisible] = useState(false);
  const [activeExerciseRowId, setActiveExerciseRowId] = useState<string | null>(null);
  const [activeExerciseName, setActiveExerciseName] = useState('');
  const [activeExerciseDescription, setActiveExerciseDescription] = useState('');
  const [draftSetCount, setDraftSetCount] = useState(DEFAULT_SET_COUNT);
  const [draftSets, setDraftSets] = useState<ExerciseSetDraft[]>([]);
  const [logView, setLogView] = useState<'sets' | 'pick-value' | 'pick-remove'>('sets');
  const [activePickerField, setActivePickerField] = useState<'reps' | 'weight' | null>(null);
  const [activePickerRowIndex, setActivePickerRowIndex] = useState<number | null>(null);
  const [selectedSetIndexToRemove, setSelectedSetIndexToRemove] = useState<number | null>(null);
  const {
    savedWorkouts,
    savedExercises,
    customExercises,
    hasHydrated: savedHydrated,
  } = useSavedWorkoutsStore();
  const {
    schedule,
    completedDates,
    workoutLogsByDate,
    assignWorkoutToDate,
    clearDateAssignment,
    toggleDateCompleted,
    setDateCompleted,
    setExerciseLog,
    clearLogsForDateWorkout,
    cleanupInvalidAssignments,
    hasHydrated: scheduleHydrated,
  } = useScheduleStore();
  const { seededExercises: catalogExercises, hasHydrated: catalogHydrated, runSeedIfNeeded } = useExerciseCatalogStore();

  useEffect(() => {
    if (catalogHydrated) {
      runSeedIfNeeded();
    }
  }, [catalogHydrated, runSeedIfNeeded]);

  const availableSeededExercisesInScreen = useMemo(() => (catalogHydrated ? catalogExercises : []), [catalogHydrated, catalogExercises]);

  const today = new Date();
  const todayDateKey = toLocalDateKey(today);
  const weekdayTitle = WEEK_DAYS[today.getDay()];
  const assignedWorkoutId = schedule[todayDateKey] ?? null;
  const assignedWorkout = useMemo(
    () => savedWorkouts.find(workout => workout.id === assignedWorkoutId) ?? null,
    [savedWorkouts, assignedWorkoutId],
  );
  const isCompletedToday = Boolean(completedDates[todayDateKey]);

  const exerciseById = useMemo(() => {
    const map = new Map<string, { id: string; name: string; description?: string }>();

    availableSeededExercisesInScreen.forEach(exercise => {
      map.set(exercise.id, exercise);
    });

    savedExercises.forEach(exercise => {
      map.set(exercise.id, exercise);
      if (exercise.originalId) {
        map.set(exercise.originalId, exercise);
      }
    });

    customExercises.forEach(exercise => {
      map.set(exercise.id, exercise);
    });

    return map;
  }, [availableSeededExercisesInScreen, savedExercises, customExercises]);

  const todayExercises = useMemo(() => {
    if (!assignedWorkout) return [];

    return assignedWorkout.exercises.map((exerciseId, index) => {
      const resolvedExercise = exerciseById.get(exerciseId);
      return {
        id: `${exerciseId}-${index}`,
        sourceExerciseId: exerciseId,
        name: resolvedExercise?.name ?? exerciseId.replace(/-/g, ' '),
        description: resolvedExercise?.description ?? 'No description available.',
      };
    });
  }, [assignedWorkout, exerciseById]);

  useEffect(() => {
    if (!savedHydrated || !scheduleHydrated) return;
    cleanupInvalidAssignments(savedWorkouts.map(workout => workout.id));
  }, [savedHydrated, scheduleHydrated, savedWorkouts, cleanupInvalidAssignments]);

  useEffect(() => {
    setCheckedExercises({});
  }, [assignedWorkoutId]);

  const inferDefaultWeight = (exerciseName: string): number => {
    const normalized = exerciseName.toLowerCase();
    if (normalized.includes('dumbbell')) return 20;
    if (normalized.includes('barbell') || normalized.includes('ez-bar') || normalized.includes('ez bar')) return 100;
    return 100;
  };

  const normalizeReps = (value: number): number => {
    const rounded = Math.round(value);
    const nearestEven = Math.round(rounded / 2) * 2;
    return Math.min(30, Math.max(2, nearestEven));
  };

  const normalizeWeight = (value: number): number => {
    const rounded = Math.round(value);
    const nearestFive = Math.round(rounded / 5) * 5;
    return Math.min(500, Math.max(5, nearestFive));
  };

  const createDefaultSetRows = (count: number, defaultWeight: number): ExerciseSetDraft[] =>
    Array.from({ length: count }, () => ({
      reps: String(DEFAULT_REPS),
      weight: String(normalizeWeight(defaultWeight)),
    }));

  const openExerciseLog = (exerciseRowId: string) => {
    if (!assignedWorkoutId) return;

    const selectedExercise = todayExercises.find(exercise => exercise.id === exerciseRowId);
    if (!selectedExercise) return;

    const existingLog = workoutLogsByDate[todayDateKey]?.[assignedWorkoutId]?.[exerciseRowId];
    const defaultWeight = inferDefaultWeight(selectedExercise.name);

    setActiveExerciseRowId(exerciseRowId);
    setActiveExerciseName(selectedExercise.name);
    setActiveExerciseDescription(selectedExercise.description);

    if (existingLog) {
      const normalizedSets = existingLog.sets.slice(0, existingLog.setCount).map(setRow => ({
        reps: normalizeReps(setRow.reps),
        weight: normalizeWeight(setRow.weight),
      }));

      const changed = normalizedSets.some(
        (setRow, index) => setRow.reps !== existingLog.sets[index]?.reps || setRow.weight !== existingLog.sets[index]?.weight,
      );

      if (changed) {
        setExerciseLog(todayDateKey, assignedWorkoutId, exerciseRowId, {
          setCount: existingLog.setCount,
          sets: normalizedSets,
          updatedAt: new Date().toISOString(),
        });
      }

      setDraftSetCount(existingLog.setCount);
      setDraftSets(
        normalizedSets.map(setRow => ({
          reps: String(setRow.reps),
          weight: String(setRow.weight),
        })),
      );
    } else {
      setDraftSetCount(DEFAULT_SET_COUNT);
      setDraftSets(createDefaultSetRows(DEFAULT_SET_COUNT, defaultWeight));
    }

    setExerciseLogVisible(true);
  };

  const closeExerciseLog = () => {
    setExerciseLogVisible(false);
    setLogView('sets');
    setActivePickerField(null);
    setActivePickerRowIndex(null);
    setSelectedSetIndexToRemove(null);
    setActiveExerciseRowId(null);
    setActiveExerciseName('');
    setActiveExerciseDescription('');
    setDraftSetCount(DEFAULT_SET_COUNT);
    setDraftSets([]);
  };

  const handleSetCountDecrease = () => {
    if (draftSetCount <= MIN_SET_COUNT) return;
    setSelectedSetIndexToRemove(null);
    setLogView('pick-remove');
  };

  const handleSetCountIncrease = () => {
    const nextCount = draftSetCount + 1;
    if (nextCount > MAX_SET_COUNT) return;
    const defaultWeight = inferDefaultWeight(activeExerciseName);
    setDraftSets(prev => [...prev, ...createDefaultSetRows(1, defaultWeight)]);
    setDraftSetCount(nextCount);
  };

  const openValuePicker = (rowIndex: number, field: 'reps' | 'weight') => {
    setActivePickerRowIndex(rowIndex);
    setActivePickerField(field);
    setLogView('pick-value');
  };

  const handleSelectPickerValue = (value: number) => {
    if (activePickerRowIndex === null || !activePickerField) return;
    setDraftSets(prev =>
      prev.map((row, idx) => {
        if (idx !== activePickerRowIndex) return row;
        return { ...row, [activePickerField]: String(value) };
      }),
    );
    setLogView('sets');
    setActivePickerField(null);
    setActivePickerRowIndex(null);
  };

  const confirmRemoveSet = () => {
    if (selectedSetIndexToRemove === null) {
      Alert.alert('Select set', 'Please select one set to remove.');
      return;
    }
    const retained = draftSets.filter((_, index) => index !== selectedSetIndexToRemove);
    setDraftSets(retained);
    setDraftSetCount(prev => Math.max(MIN_SET_COUNT, prev - 1));
    setSelectedSetIndexToRemove(null);
    setLogView('sets');
  };

  const handleSaveExerciseLog = () => {
    if (!activeExerciseRowId || !assignedWorkoutId) return;

    const normalizedSets = draftSets.slice(0, draftSetCount).map((row, index) => {
      const reps = Number.parseInt(row.reps, 10);
      const weight = Number.parseInt(row.weight, 10);

      if (Number.isNaN(reps) || Number.isNaN(weight)) {
        throw new Error(`Set ${index + 1} requires integer reps and weight.`);
      }

      return { reps: normalizeReps(reps), weight: normalizeWeight(weight) };
    });

    try {
      const payload: ExerciseLogEntry = {
        setCount: draftSetCount,
        sets: normalizedSets,
        updatedAt: new Date().toISOString(),
      };

      setExerciseLog(todayDateKey, assignedWorkoutId, activeExerciseRowId, payload);
      closeExerciseLog();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please enter integer values for all fields.';
      Alert.alert('Invalid input', message);
    }
  };

  const closeWorkoutSelector = () => setWorkoutSelectorVisible(false);

  const handleAssignWorkout = (workoutId: string) => {
    const currentWorkoutId = schedule[todayDateKey];
    const isCompleted = Boolean(completedDates[todayDateKey]);
    const isChangingCompletedDay = isCompleted && Boolean(currentWorkoutId) && currentWorkoutId !== workoutId;

    if (isChangingCompletedDay) {
      Alert.alert(
        'Change completed workout?',
        'This day is marked completed. Changing the workout will remove completed status for this day.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change Workout',
            style: 'destructive',
            onPress: () => {
              if (currentWorkoutId) {
                clearLogsForDateWorkout(todayDateKey, currentWorkoutId);
              }
              assignWorkoutToDate(todayDateKey, workoutId);
              setDateCompleted(todayDateKey, false);
              closeWorkoutSelector();
            },
          },
        ],
      );
      return;
    }

    if (currentWorkoutId && currentWorkoutId !== workoutId) {
      clearLogsForDateWorkout(todayDateKey, currentWorkoutId);
    }
    assignWorkoutToDate(todayDateKey, workoutId);
    closeWorkoutSelector();
  };

  const handleClearToday = () => {
    clearDateAssignment(todayDateKey);
    setDateCompleted(todayDateKey, false);
    closeWorkoutSelector();
  };

  const handleToggleExercise = (exerciseRowId: string) => {
    setCheckedExercises(prev => ({
      ...prev,
      [exerciseRowId]: !prev[exerciseRowId],
    }));
  };

  if (!savedHydrated || !scheduleHydrated) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.todayContainer}>
      <View style={[styles.todayCard, isCompletedToday && styles.todayCardCompleted]}>
        <View style={[styles.todayHeaderRow, isCompletedToday && styles.todayHeaderRowCompleted]}>
          <Text style={styles.todayHeader}>{weekdayTitle}</Text>
        </View>

        {assignedWorkout ? (
          <>
            <View style={[styles.todayWorkoutTitleContainer, isCompletedToday && styles.todayWorkoutTitleContainerCompleted]}>
              <Text style={styles.todayWorkoutTitle}>{assignedWorkout.name}</Text>
            </View>
            <TouchableOpacity style={styles.changeTodayButton} onPress={() => setWorkoutSelectorVisible(true)}>
              <Text style={styles.changeTodayButtonText}>Change Today&apos;s Workout</Text>
            </TouchableOpacity>

            <ScrollView style={styles.todayExercisesList} contentContainerStyle={styles.todayExercisesListContent}>
              {todayExercises.map(exercise => {
                const checked = Boolean(checkedExercises[exercise.id]);

                return (
                  <View key={exercise.id} style={styles.todayExerciseRow}>
                    <TouchableOpacity
                      style={styles.sessionCheckboxTapTarget}
                      onPress={() => handleToggleExercise(exercise.id)}>
                      <View style={[styles.sessionCheckbox, checked && styles.sessionCheckboxChecked]}>
                        {checked ? <Text style={styles.sessionCheckboxCheck}>✓</Text> : null}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.todayExerciseNameButton} onPress={() => openExerciseLog(exercise.id)}>
                      <Text style={styles.todayExerciseName}>{exercise.name}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyTodayWrap}>
            <TouchableOpacity style={styles.addTodayButton} onPress={() => setWorkoutSelectorVisible(true)}>
              <Text style={styles.addTodayButtonText}>Add workout for today</Text>
            </TouchableOpacity>
          </View>
        )}

        {assignedWorkout ? (
          <TouchableOpacity
            style={[styles.completeButton, isCompletedToday && styles.completeButtonCompleted]}
            onPress={() => toggleDateCompleted(todayDateKey)}>
            <Text style={[styles.completeButtonText, isCompletedToday && styles.completeButtonTextCompleted]}>
              {isCompletedToday ? 'Completed ✓' : 'Workout Completed'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal
        visible={workoutSelectorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeWorkoutSelector}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeX} onPress={closeWorkoutSelector}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Assign Workout</Text>
            <Text style={styles.modalSubtitle}>Today ({todayDateKey})</Text>

            <ScrollView style={styles.workoutList}>
              {savedWorkouts.length === 0 ? (
                <Text style={styles.emptyWorkoutOptionsText}>No saved workouts yet</Text>
              ) : (
                savedWorkouts.map(workout => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.workoutOption}
                    onPress={() => handleAssignWorkout(workout.id)}>
                    <Text style={styles.workoutOptionText}>{workout.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {assignedWorkout ? (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearToday}>
                <Text style={styles.clearButtonText}>Clear Day</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.closeButton} onPress={closeWorkoutSelector}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={exerciseLogVisible} transparent animationType="fade" onRequestClose={closeExerciseLog}>
        <View style={styles.modalOverlay}>
          <View style={styles.exerciseLogModalContent}>

            {/* ── SETS VIEW ── */}
            {logView === 'sets' && (
              <>
                <Text style={styles.modalTitle}>{activeExerciseName}</Text>
                <Text style={styles.exerciseLogDescription}>{activeExerciseDescription}</Text>

                <View style={styles.setCountRow}>
                  <Text style={styles.setCountLabel}>Sets</Text>
                  <View style={styles.setCountControls}>
                    <TouchableOpacity
                      style={[styles.setCountButton, draftSetCount <= MIN_SET_COUNT && styles.setCountButtonDisabled]}
                      onPress={handleSetCountDecrease}>
                      <Text style={styles.setCountButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.setCountValue}>{draftSetCount}</Text>
                    <TouchableOpacity
                      style={[styles.setCountButton, draftSetCount >= MAX_SET_COUNT && styles.setCountButtonDisabled]}
                      onPress={handleSetCountIncrease}>
                      <Text style={styles.setCountButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.setTableHeaderRow}>
                  <Text style={styles.setTableSetHeader}>Set</Text>
                  <Text style={styles.setTableRepsHeader}>Reps</Text>
                  <Text style={styles.setTableWeightHeader}>Weight (lbs)</Text>
                </View>

                <ScrollView style={styles.exerciseLogList}>
                  {draftSets.slice(0, draftSetCount).map((setRow, index) => (
                    <View key={`set-${index}`} style={styles.setRow}>
                      <Text style={styles.setRowLabel}>Set {index + 1}</Text>
                      <TouchableOpacity
                        style={[styles.setPickerButton, styles.repsPickerButton]}
                        onPress={() => openValuePicker(index, 'reps')}>
                        <Text style={styles.setPickerButtonText}>{setRow.reps}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.setPickerButton, styles.weightPickerButton]}
                        onPress={() => openValuePicker(index, 'weight')}>
                        <Text style={styles.setPickerButtonText}>{setRow.weight}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.exerciseLogButtonsRow}>
                  <TouchableOpacity style={styles.exerciseLogCancelButton} onPress={closeExerciseLog}>
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exerciseLogSaveButton} onPress={handleSaveExerciseLog}>
                    <Text style={styles.exerciseLogSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── VALUE PICKER VIEW ── */}
            {logView === 'pick-value' && (
              <>
                <Text style={styles.modalTitle}>
                  {activePickerField === 'weight' ? 'Select Weight (lbs)' : 'Select Reps'}
                </Text>
                <ScrollView style={styles.valuePickerList}>
                  {(activePickerField === 'weight' ? WEIGHT_OPTIONS : REP_OPTIONS).map(option => (
                    <TouchableOpacity
                      key={`pick-${activePickerField}-${option}`}
                      style={styles.valuePickerOption}
                      onPress={() => handleSelectPickerValue(option)}>
                      <Text style={styles.valuePickerOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setLogView('sets');
                    setActivePickerField(null);
                    setActivePickerRowIndex(null);
                  }}>
                  <Text style={styles.closeButtonText}>Back</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── REMOVE SET PICKER VIEW ── */}
            {logView === 'pick-remove' && (
              <>
                <Text style={styles.modalTitle}>Select set to remove</Text>
                <Text style={styles.modalSubtitle}>Tap a set row to select, then tap Remove.</Text>
                <ScrollView style={styles.removeSetsList}>
                  {draftSets.slice(0, draftSetCount).map((_, index) => {
                    const selected = selectedSetIndexToRemove === index;
                    return (
                      <TouchableOpacity
                        key={`remove-${index}`}
                        style={[styles.removeSetRow, selected && styles.removeSetRowSelected]}
                        onPress={() => setSelectedSetIndexToRemove(prev => (prev === index ? null : index))}>
                        <Text style={styles.removeSetRowText}>Set {index + 1}</Text>
                        <Text style={styles.removeSetRowText}>{selected ? '☑' : '☐'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <View style={styles.exerciseLogButtonsRow}>
                  <TouchableOpacity
                    style={styles.exerciseLogCancelButton}
                    onPress={() => {
                      setLogView('sets');
                      setSelectedSetIndexToRemove(null);
                    }}>
                    <Text style={styles.closeButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exerciseLogSaveButton} onPress={confirmRemoveSet}>
                    <Text style={styles.exerciseLogSaveText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

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
  todayContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 56,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
  todayCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 28,
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
  },
  todayCardCompleted: {
    borderColor: '#2CD66F',
  },
  todayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    marginBottom: 8,
    position: 'relative',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  todayHeaderRowCompleted: {
    backgroundColor: '#2CD66F',
  },
  todayHeader: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: '#fff',
  },
  todayWorkoutTitleContainer: {
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  todayWorkoutTitleContainerCompleted: {
    backgroundColor: '#2CD66F',
  },
  todayWorkoutTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 44,
    paddingVertical: 6,
  },
  changeTodayButton: {
    alignSelf: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  changeTodayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  todayExercisesList: {
    flex: 1,
  },
  todayExercisesListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 12,
  },
  todayExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionCheckboxTapTarget: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  sessionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sessionCheckboxChecked: {
    backgroundColor: '#fff',
  },
  sessionCheckboxCheck: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  todayExerciseNameButton: {
    flex: 1,
    paddingVertical: 4,
  },
  todayExerciseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  emptyTodayWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTodayButton: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: '#111',
    paddingVertical: 16,
    paddingHorizontal: 22,
    minWidth: 240,
    alignItems: 'center',
  },
  addTodayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  completeButton: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeButtonCompleted: {
    borderColor: '#2CD66F',
    backgroundColor: '#2CD66F',
  },
  completeButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
  },
  completeButtonTextCompleted: {
    color: '#062b12',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
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
    width: '100%',
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
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 4,
    elevation: 5,
    overflow: 'hidden',
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
  modalSubtitle: {
    color: '#aaa',
    fontSize: 15,
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
  emptyWorkoutOptionsText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 16,
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
  exerciseLogModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  exerciseLogDescription: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 14,
  },
  setCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  setCountLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  setCountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setCountButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCountButtonDisabled: {
    opacity: 0.3,
  },
  setCountButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 21,
  },
  setCountValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    minWidth: 22,
    textAlign: 'center',
  },
  exerciseLogList: {
    maxHeight: 280,
    marginBottom: 12,
  },
  setTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  setTableSetHeader: {
    width: 56,
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  setTableRepsHeader: {
    width: 84,
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginRight: 8,
  },
  setTableWeightHeader: {
    flex: 1,
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  setRowLabel: {
    color: '#fff',
    width: 56,
    fontSize: 14,
    fontWeight: '600',
  },
  setPickerButton: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  repsPickerButton: {
    width: 84,
    marginRight: 8,
  },
  weightPickerButton: {
    flex: 1,
  },
  setPickerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseLogButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exerciseLogCancelButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exerciseLogSaveButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exerciseLogSaveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  valuePickerList: {
    maxHeight: 300,
    marginVertical: 12,
  },
  valuePickerOption: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  valuePickerOptionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  removeSetsList: {
    maxHeight: 240,
    marginBottom: 12,
  },
  removeSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  removeSetRowSelected: {
    backgroundColor: '#1a3320',
    borderWidth: 1,
    borderColor: '#2CD66F',
  },
  removeSetRowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
