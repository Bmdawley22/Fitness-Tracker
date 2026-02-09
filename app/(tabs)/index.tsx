import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { exercises } from '@/data/exercises';
import { workouts } from '@/data/workouts';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';

type FilterType = 'all' | 'workouts' | 'exercises';

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('exercises');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<string | null>(null);
  const [showWorkoutSelectionModal, setShowWorkoutSelectionModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [workoutToAdd, setWorkoutToAdd] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addWorkout, isWorkoutSaved, savedWorkouts } = useSavedWorkoutsStore();

  // Show toast for a few seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleExercisePlusClick = (exerciseId: string) => {
    setExerciseToAdd(exerciseId);
    setShowAddExerciseModal(true);
  };

  const handleWorkoutPlusClick = (workoutId: string) => {
    setWorkoutToAdd(workoutId);
    setShowAddWorkoutModal(true);
  };

  const handleAddToExistingWorkout = () => {
    setShowAddExerciseModal(false);
    setShowWorkoutSelectionModal(true);
  };

  const handleAddWorkoutToSaved = () => {
    if (!workoutToAdd) return;
    
    const workout = workouts.find(w => w.id === workoutToAdd);
    if (!workout) return;

    if (isWorkoutSaved(workout.id)) {
      setToastMessage('Already saved!');
      setShowAddWorkoutModal(false);
      setWorkoutToAdd(null);
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

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {selectedFilter === 'exercises' && exercises.map(exercise => (
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
        ))}

        {selectedFilter === 'workouts' && workouts.map(workout => (
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
              style={styles.plusButton}
              onPress={() => handleWorkoutPlusClick(workout.id)}>
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
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
              style={styles.closeButton}
              onPress={() => setSelectedExercise(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
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
                  style={styles.addToSavedButton}
                  onPress={handleAddWorkoutFromDetailModal}>
                  <Text style={styles.addToSavedButtonText}>+</Text>
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
              onPress={() => {
                setShowAddExerciseModal(false);
                // TODO: Add to saved exercises
              }}>
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
            {savedWorkouts.length === 0 ? (
              <Text style={styles.noWorkoutsText}>No saved workouts.</Text>
            ) : (
              <ScrollView style={styles.workoutSelectionList}>
                {savedWorkouts.map(workout => (
                  <TouchableOpacity 
                    key={workout.id}
                    style={styles.workoutSelectionItem}
                    onPress={() => {
                      // TODO: Add exercise to workout
                      setShowWorkoutSelectionModal(false);
                      setExerciseToAdd(null);
                    }}>
                    <Text style={styles.workoutSelectionText}>{workout.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
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
              Add "{workoutToAddData?.name}" to your Saved Workouts?
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
  plusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
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
