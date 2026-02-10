import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { exercises } from '@/data/exercises';
import { workouts } from '@/data/workouts';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';
import { useUIStore } from '@/store/uiState';

type FilterType = 'all' | 'workouts' | 'exercises';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { addWorkout, isWorkoutSaved, savedWorkouts, addExerciseToWorkout, addExercise, isExerciseSaved } = useSavedWorkoutsStore();
  const { setWorkoutEditState, clearWorkoutEditState } = useUIStore();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('exercises');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState('All');
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<string | null>(null);
  const [showWorkoutSelectionModal, setShowWorkoutSelectionModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [workoutToAdd, setWorkoutToAdd] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Duplicate detection states
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [conflictingWorkout, setConflictingWorkout] = useState<{ id: string; name: string } | null>(null);
  const [pendingWorkoutToAdd, setPendingWorkoutToAdd] = useState<string | null>(null);
  const [showConfirmAddAfterRename, setShowConfirmAddAfterRename] = useState(false);
  const [showNameStillMatches, setShowNameStillMatches] = useState(false);

  // Check if saved workout differs from original
  const exerciseCategories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(exercises.map(exercise => exercise.category)));
    const priority = ['Triceps', 'Back', 'Legs', 'Abs'];
    const prioritized = priority.filter(category => uniqueCategories.includes(category));
    const rest = uniqueCategories
      .filter(category => !priority.includes(category))
      .sort();
    return ['All', ...prioritized, ...rest];
  }, []);

  useEffect(() => {
    if (selectedFilter !== 'exercises') {
      setSelectedExerciseCategory('All');
    }
  }, [selectedFilter]);

  const filteredExercises = useMemo(() => {
    if (selectedFilter !== 'exercises') return [];
    if (selectedExerciseCategory === 'All') return exercises;
    return exercises.filter(exercise => exercise.category === selectedExerciseCategory);
  }, [selectedFilter, selectedExerciseCategory]);

  // Check if saved workout differs from original
  const hasWorkoutChanged = (originalId: string): boolean => {
    const original = workouts.find(w => w.id === originalId);
    const saved = savedWorkouts.find(w => w.originalId === originalId);
    
    if (!original || !saved) return false;
    
    // Compare name, description, and exercises
    return (
      saved.name !== original.name ||
      saved.description !== original.description ||
      saved.exercises.length !== original.exercises.length ||
      !saved.exercises.every((ex, i) => ex === original.exercises[i])
    );
  };

  // Find a saved workout by name
  const findSavedWorkoutByName = (name: string) => {
    return savedWorkouts.find(w => w.name === name);
  };

  // Handle rename - navigate to Saved tab and open edit modal
  const handleRenameSavedWorkout = () => {
    if (!conflictingWorkout || !pendingWorkoutToAdd) return;
    
    // Set UI state for the workouts tab to handle edit
    setWorkoutEditState(conflictingWorkout.id, pendingWorkoutToAdd, workouts.find(w => w.id === pendingWorkoutToAdd)?.name || null);
    
    // Close current modals
    setShowDuplicateModal(false);
    
    // Navigate to Saved tab (assuming it's called 'workouts')
    navigation.navigate('workouts' as never);
  };

  // Handle confirming add after rename
  const handleConfirmAddAfterRename = () => {
    if (!pendingWorkoutToAdd) return;
    
    const workoutToAddData = workouts.find(w => w.id === pendingWorkoutToAdd);
    if (!workoutToAddData) return;
    
    // Check if name still conflicts
    const stillConflicts = findSavedWorkoutByName(workoutToAddData.name);
    if (stillConflicts) {
      // Show "Name still matches" modal
      setShowNameStillMatches(true);
      setShowConfirmAddAfterRename(false);
      return;
    }
    
    // Add the workout
    const success = addWorkout({
      originalId: workoutToAddData.id,
      name: workoutToAddData.name,
      description: workoutToAddData.description,
      exercises: [...workoutToAddData.exercises],
    });

    if (success) {
      setToastMessage('Workout saved!');
    }
    
    // Clear states
    setShowConfirmAddAfterRename(false);
    setPendingWorkoutToAdd(null);
    setConflictingWorkout(null);
    clearWorkoutEditState();
  };

  // Show toast for a few seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addExerciseToSavedById = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return false;

    if (isExerciseSaved(exerciseId)) {
      Alert.alert('Already Saved', `"${exercise.name}" is already in your saved exercises.`);
      return false;
    }

    const success = addExercise({
      originalId: exercise.id,
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
    });

    if (success) {
      setToastMessage(`"${exercise.name}" added to saved exercises!`);
      return true;
    }

    Alert.alert('Already Saved', `"${exercise.name}" is already in your saved exercises.`);
    return false;
  };

  const handleAddToSavedExercises = () => {
    if (!exerciseToAdd) return;

    setShowAddExerciseModal(false);
    addExerciseToSavedById(exerciseToAdd);
    setExerciseToAdd(null);
  };

  const handleExercisePlusClick = (exerciseId: string) => {
    setExerciseToAdd(exerciseId);
    setShowAddExerciseModal(true);
  };

  const handleWorkoutPlusClick = (workoutId: string) => {
    setWorkoutToAdd(workoutId);
    setShowAddWorkoutModal(true);
  };

  const handleAddExerciseToExistingFromDetailModal = () => {
    if (!selectedExercise) return;
    const exerciseId = selectedExercise;
    setSelectedExercise(null);

    if (savedWorkouts.length === 0) {
      Alert.alert('You have no Saved Workouts', 'OK');
      return;
    }

    setExerciseToAdd(exerciseId);
    setShowWorkoutSelectionModal(true);
  };

  const handleAddExerciseToSavedFromDetailModal = () => {
    if (!selectedExercise) return;
    const exerciseId = selectedExercise;
    setSelectedExercise(null);
    addExerciseToSavedById(exerciseId);
  };

  const handleAddToExistingWorkout = () => {
    setShowAddExerciseModal(false);
    
    // Check if there are any saved workouts
    if (savedWorkouts.length === 0) {
      Alert.alert("You have no Saved Workouts", "OK");
      setExerciseToAdd(null);
      return;
    }
    
    setShowWorkoutSelectionModal(true);
  };

  const handleWorkoutSelection = (workoutId: string, workoutName: string) => {
    if (!exerciseToAdd) return;
    
    const workout = savedWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    // Check for duplicate
    if (workout.exercises.includes(exerciseToAdd)) {
      Alert.alert(`This exercise is already in ${workoutName}`, "OK");
      setShowWorkoutSelectionModal(false);
      setExerciseToAdd(null);
      return;
    }
    
    // Show confirmation dialog
    Alert.alert(
      `Save to ${workoutName}?`,
      "Add this exercise to your workout",
      [
        { text: "Cancel", style: "cancel", onPress: () => {
          setShowWorkoutSelectionModal(false);
          setExerciseToAdd(null);
        }},
        { text: "Save", onPress: () => {
          const success = addExerciseToWorkout(workoutId, exerciseToAdd);
          if (success) {
            setToastMessage(`Exercise added to ${workoutName}!`);
          } else {
            Alert.alert('Limit reached', 'You can only add 12 exercises to a workout.');
          }
          // Auto-close modal after 1 second
          setTimeout(() => {
            setShowWorkoutSelectionModal(false);
            setExerciseToAdd(null);
          }, 1000);
        }}
      ]
    );
  };

  const handleAddWorkoutToSaved = () => {
    if (!workoutToAdd) return;
    
    const workout = workouts.find(w => w.id === workoutToAdd);
    if (!workout) return;

    // Check for duplicate name (allows saving same workout with different names)
    const duplicate = findSavedWorkoutByName(workout.name);
    if (duplicate) {
      // Show duplicate modal
      setConflictingWorkout({ id: duplicate.id, name: duplicate.name });
      setPendingWorkoutToAdd(workoutToAdd);
      setShowDuplicateModal(true);
      setShowAddWorkoutModal(false);
      return;
    }

    const success = addWorkout({
      originalId: workout.id,
      name: workout.name,
      description: workout.description,
      exercises: [...workout.exercises],
    });

    if (success) {
      setToastMessage('Workout saved!');
    }
    
    setShowAddWorkoutModal(false);
    setWorkoutToAdd(null);
  };

  const handleAddWorkoutFromDetailModal = () => {
    if (!selectedWorkout) return;
    setWorkoutToAdd(selectedWorkout);
    setShowAddWorkoutModal(true);
  };

  const selectedExerciseData = selectedExercise 
    ? exercises.find(e => e.id === selectedExercise) 
    : null;
  
  const selectedWorkoutData = selectedWorkout
    ? workouts.find(w => w.id === selectedWorkout)
    : null;

  // Check if the selected workout can be saved
  const canSaveSelectedWorkout = selectedWorkout
    ? !isWorkoutSaved(selectedWorkout) || hasWorkoutChanged(selectedWorkout)
    : false;

  const exerciseToAddData = exerciseToAdd
    ? exercises.find(e => e.id === exerciseToAdd)
    : null;

  const workoutToAddData = workoutToAdd
    ? workouts.find(w => w.id === workoutToAdd)
    : null;

  // Get exercise names for a workout
  const getWorkoutExercises = (exerciseIds: string[]) => {
    return exerciseIds.map(id => exercises.find(e => e.id === id)).filter(Boolean);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Home</Text>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}>
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'workouts' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('workouts')}>
          <Text style={[styles.filterText, selectedFilter === 'workouts' && styles.filterTextActive]}>
            Workouts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'exercises' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('exercises')}>
          <Text style={[styles.filterText, selectedFilter === 'exercises' && styles.filterTextActive]}>
            Exercises
          </Text>
        </TouchableOpacity>
      </View>

      {selectedFilter === 'exercises' && (
        <View style={styles.categoryFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterScroll}>
            {exerciseCategories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryFilterButton,
                  selectedExerciseCategory === category && styles.categoryFilterButtonActive,
                ]}
                onPress={() => setSelectedExerciseCategory(category)}>
                <Text
                  style={[
                    styles.categoryFilterText,
                    selectedExerciseCategory === category && styles.categoryFilterTextActive,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {selectedFilter === 'exercises' && (
          filteredExercises.length === 0 ? (
            <Text style={styles.noExercisesText}>No exercises found in {
              selectedExerciseCategory === 'All' ? 'this list' : selectedExerciseCategory
            }.</Text>
          ) : (
            filteredExercises.map(exercise => (
              <View key={exercise.id} style={styles.listItem}>
                <TouchableOpacity 
                  style={styles.listItemButton}
                  onPress={() => setSelectedExercise(exercise.id)}>
                  <Text style={styles.listItemText}>{exercise.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.plusButton}
                  onPress={() => handleExercisePlusClick(exercise.id)}>
                  <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        )}

        {selectedFilter === 'workouts' && workouts.map(workout => {
          const isSaved = isWorkoutSaved(workout.id);
          const hasChanged = hasWorkoutChanged(workout.id);
          const canSave = !isSaved || hasChanged;
          
          return (
            <View key={workout.id} style={styles.listItem}>
              <TouchableOpacity 
                style={styles.listItemButton}
                onPress={() => setSelectedWorkout(workout.id)}>
                <View>
                  <Text style={styles.listItemText}>{workout.name}</Text>
                  <Text style={styles.listItemDescription}>{workout.description}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.plusButton,
                  !canSave && styles.plusButtonDisabled
                ]}
                onPress={canSave ? () => handleWorkoutPlusClick(workout.id) : undefined}
                disabled={!canSave}>
                <Text style={[
                  styles.plusText,
                  !canSave && styles.plusTextDisabled
                ]}>+</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Toast */}
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Exercise Detail Modal */}
      <Modal
        visible={selectedExercise !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedExercise(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => setSelectedExercise(null)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedExerciseData?.name}</Text>
            <Text style={styles.modalDescription}>{selectedExerciseData?.description}</Text>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleAddExerciseToExistingFromDetailModal}>
              <Text style={styles.optionButtonText}>Add to Existing Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleAddExerciseToSavedFromDetailModal}>
              <Text style={styles.optionButtonText}>Add to Saved Exercises</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Detail Modal */}
      <Modal
        visible={selectedWorkout !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedWorkout(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.workoutModalContent}>
            {/* Header with X and title */}
            <View style={styles.workoutModalHeader}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.modalTitle}>{selectedWorkoutData?.name}</Text>
                <TouchableOpacity 
                  style={[
                    styles.addToSavedButton,
                    !canSaveSelectedWorkout && styles.addToSavedButtonDisabled
                  ]}
                  onPress={canSaveSelectedWorkout ? handleAddWorkoutFromDetailModal : undefined}
                  disabled={!canSaveSelectedWorkout}>
                  <Text style={[
                    styles.addToSavedButtonText,
                    !canSaveSelectedWorkout && styles.addToSavedButtonTextDisabled
                  ]}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.closeX}
                onPress={() => setSelectedWorkout(null)}>
                <Text style={styles.closeXText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>{selectedWorkoutData?.description}</Text>
            
            {/* Exercises List */}
            <Text style={styles.exercisesHeader}>Exercises</Text>
            <ScrollView style={styles.exercisesList}>
              {selectedWorkoutData && getWorkoutExercises(selectedWorkoutData.exercises).map((exercise, index) => (
                <View key={exercise?.id || index} style={styles.exerciseListItem}>
                  <Text style={styles.exerciseListText}>{exercise?.name}</Text>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedWorkout(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddExerciseModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => setShowAddExerciseModal(false)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleAddToExistingWorkout}>
              <Text style={styles.optionButtonText}>Add to Existing Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleAddToSavedExercises}>
              <Text style={styles.optionButtonText}>Add to Saved Exercises</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAddExerciseModal(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Selection Modal */}
      <Modal
        visible={showWorkoutSelectionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWorkoutSelectionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => {
                setShowWorkoutSelectionModal(false);
                setExerciseToAdd(null);
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add {exerciseToAddData?.name} to Workout Below
            </Text>
            <ScrollView style={styles.workoutSelectionList}>
              {savedWorkouts.map(workout => (
                <TouchableOpacity 
                  key={workout.id}
                  style={styles.workoutSelectionItem}
                  onPress={() => handleWorkoutSelection(workout.id, workout.name)}>
                  <Text style={styles.workoutSelectionText}>{workout.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowWorkoutSelectionModal(false);
                setExerciseToAdd(null);
              }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Workout to Saved Modal */}
      <Modal
        visible={showAddWorkoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowAddWorkoutModal(false);
          setWorkoutToAdd(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => {
                setShowAddWorkoutModal(false);
                setWorkoutToAdd(null);
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add &ldquo;{workoutToAddData?.name}&rdquo; to your Saved Workouts?
            </Text>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleAddWorkoutToSaved}>
              <Text style={styles.optionButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowAddWorkoutModal(false);
                setWorkoutToAdd(null);
              }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Duplicate Workout Modal */}
      <Modal
        visible={showDuplicateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDuplicateModal(false);
          setPendingWorkoutToAdd(null);
          setConflictingWorkout(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => {
                setShowDuplicateModal(false);
                setPendingWorkoutToAdd(null);
                setConflictingWorkout(null);
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Duplicate Workout</Text>
            <Text style={styles.modalDescription}>
              Do you want to rename your existing workout and add this workout?
            </Text>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleRenameSavedWorkout}>
              <Text style={styles.optionButtonText}>
                Rename &ldquo;{conflictingWorkout?.name}&rdquo;
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowDuplicateModal(false);
                setPendingWorkoutToAdd(null);
                setConflictingWorkout(null);
              }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Add After Rename Modal */}
      <Modal
        visible={showConfirmAddAfterRename}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmAddAfterRename(false);
          setPendingWorkoutToAdd(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => {
                setShowConfirmAddAfterRename(false);
                setPendingWorkoutToAdd(null);
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ready to Add</Text>
            <Text style={styles.modalDescription}>
              Still want to add &ldquo;{workouts.find(w => w.id === pendingWorkoutToAdd)?.name}&rdquo;?
            </Text>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleConfirmAddAfterRename}>
              <Text style={styles.optionButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowConfirmAddAfterRename(false);
                setPendingWorkoutToAdd(null);
              }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Name Still Matches Modal */}
      <Modal
        visible={showNameStillMatches}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowNameStillMatches(false);
          setPendingWorkoutToAdd(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => {
                setShowNameStillMatches(false);
                setPendingWorkoutToAdd(null);
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Name Still Matches</Text>
            <Text style={styles.modalDescription}>
              A workout with this name already exists. Please rename it again.
            </Text>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                // Go back to edit - reopen the workouts tab
                setShowNameStillMatches(false);
                if (conflictingWorkout && pendingWorkoutToAdd) {
                  setWorkoutEditState(conflictingWorkout.id, pendingWorkoutToAdd, workouts.find(w => w.id === pendingWorkoutToAdd)?.name || null);
                  navigation.navigate('workouts' as never);
                }
              }}>
              <Text style={styles.optionButtonText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowNameStillMatches(false);
                setPendingWorkoutToAdd(null);
                setConflictingWorkout(null);
                clearWorkoutEditState();
              }}>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryFilterScroll: {
    gap: 8,
  },
  categoryFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryFilterButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  categoryFilterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryFilterTextActive: {
    color: '#000',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  listItemButton: {
    flex: 1,
  },
  listItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  listItemDescription: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButtonDisabled: {
    borderColor: '#555',
    opacity: 0.5,
  },
  plusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  plusTextDisabled: {
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
    position: 'relative',
  },
  workoutModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  workoutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  addToSavedButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToSavedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  addToSavedButtonDisabled: {
    borderColor: '#555',
    opacity: 0.5,
  },
  addToSavedButtonTextDisabled: {
    color: '#555',
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
    marginBottom: 16,
    marginTop: 8,
    paddingRight: 30,
  },
  modalDescription: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  exercisesHeader: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  exercisesList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  exerciseListItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exerciseListText: {
    color: '#ccc',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  optionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  noExercisesText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 24,
  },
  noWorkoutsText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 24,
  },
  workoutSelectionList: {
    maxHeight: 200,
  },
  workoutSelectionItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutSelectionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
