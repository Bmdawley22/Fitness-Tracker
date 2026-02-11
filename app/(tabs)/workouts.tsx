import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useSavedWorkoutsStore, SavedWorkout } from '@/store/savedWorkouts';
import { exercises as allExercises } from '@/data/exercises';
import { workouts } from '@/data/workouts';
import { useUIStore } from '@/store/uiState';
import { Ionicons } from '@expo/vector-icons';

const MAX_EXERCISES = 12;

type SavedFilter = 'workouts' | 'exercises';

export default function SavedScreen() {
  const { 
    savedWorkouts, 
    savedExercises,
    customExercises,
    hasHydrated,
    removeWorkout, 
    updateWorkout,
    updateAndRegenerateId,
    removeExerciseFromWorkout,
    addWorkout,
    addExerciseToWorkout,
    removeExercise,
  } = useSavedWorkoutsStore();
  const { workoutToEditId, pendingWorkoutToAddId, pendingWorkoutToAddName, clearWorkoutEditState } = useUIStore();

  const [selectedFilter, setSelectedFilter] = useState<SavedFilter>('workouts');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [showBulkRemoveConfirmModal, setShowBulkRemoveConfirmModal] = useState(false);
  const [detailWorkout, setDetailWorkout] = useState<SavedWorkout | null>(null);
  const [detailExercise, setDetailExercise] = useState<{ id: string; name: string; description: string; originalId: string } | null>(null);
  const [menuWorkout, setMenuWorkout] = useState<SavedWorkout | null>(null);
  const [menuExercise, setMenuExercise] = useState<{ id: string; name: string; originalId: string } | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<SavedWorkout | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Exercise to workout modal states
  const [showWorkoutSelectionModal, setShowWorkoutSelectionModal] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<string | null>(null);
  const [exerciseNameToAdd, setExerciseNameToAdd] = useState<string | null>(null);
  
  // Exercise selection from edit modal states
  const [showExerciseSelectionModal, setShowExerciseSelectionModal] = useState(false);
  const [exerciseSearchText, setExerciseSearchText] = useState('');
  
  // Rename flow states
  const [showConfirmAddModal, setShowConfirmAddModal] = useState(false);
  const [pendingWorkoutInfo, setPendingWorkoutInfo] = useState<{ id: string; name: string } | null>(null);

  // Check for pending workout edit and open edit modal
  useEffect(() => {
    if (workoutToEditId) {
      const workoutToEdit = savedWorkouts.find(w => w.id === workoutToEditId);
      if (workoutToEdit) {
        setEditingWorkout(workoutToEdit);
        setEditName(workoutToEdit.name);
        setEditDescription(workoutToEdit.description);
        
        // Store pending workout info for confirmation after edit
        if (pendingWorkoutToAddId && pendingWorkoutToAddName) {
          setPendingWorkoutInfo({
            id: pendingWorkoutToAddId,
            name: pendingWorkoutToAddName
          });
        }
      }
    }
  }, [workoutToEditId, savedWorkouts, pendingWorkoutToAddId, pendingWorkoutToAddName]);

  const handleOpenMenu = (workout: SavedWorkout) => {
    setMenuWorkout(workout);
  };

  const handleOpenExerciseMenu = (exercise: { id: string; name: string; originalId: string }) => {
    setMenuExercise(exercise);
  };

  const handleOpenAddToWorkout = (exercise: { originalId: string; name: string }, options?: { closeMenu?: boolean; closeDetail?: boolean }) => {
    // Check if there are any saved workouts
    if (savedWorkouts.length === 0) {
      Alert.alert("You have no Saved Workouts", "OK");
      if (options?.closeMenu) {
        setMenuExercise(null);
      }
      return;
    }

    setExerciseToAdd(exercise.originalId);
    setExerciseNameToAdd(exercise.name);

    if (options?.closeMenu) {
      setMenuExercise(null);
    }
    if (options?.closeDetail) {
      setDetailExercise(null);
    }

    setShowWorkoutSelectionModal(true);
  };

  const handleAddExerciseToWorkout = () => {
    if (!menuExercise) return;
    handleOpenAddToWorkout(menuExercise, { closeMenu: true });
  };

  const handleWorkoutSelectionForExercise = (workoutId: string, workoutName: string) => {
    if (!exerciseToAdd) return;
    
    const workout = savedWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    // Check for duplicate
    if (workout.exercises.includes(exerciseToAdd)) {
      Alert.alert(`This exercise is already in ${workoutName}`, "OK");
      setShowWorkoutSelectionModal(false);
      setExerciseToAdd(null);
      setExerciseNameToAdd(null);
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
          setExerciseNameToAdd(null);
        }},
        { text: "Save", onPress: () => {
          const success = addExerciseToWorkout(workoutId, exerciseToAdd);
          if (success) {
            Alert.alert(`Exercise added to ${workoutName}!`, "", [
              { text: "OK", onPress: () => {
                setShowWorkoutSelectionModal(false);
                setExerciseToAdd(null);
                setExerciseNameToAdd(null);
              }}
            ]);
          } else {
            Alert.alert('Limit reached', 'You can only add 12 exercises to a workout.');
          }
        }}
      ]
    );
  };

  const handleEdit = () => {
    if (menuWorkout) {
      setEditingWorkout(menuWorkout);
      setEditName(menuWorkout.name);
      setEditDescription(menuWorkout.description);
      setMenuWorkout(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingWorkout) {
      // Always regenerate ID on edit to make it a custom entry
      // This clears originalId, allowing the original workout to be added separately
      updateAndRegenerateId(editingWorkout.id, {
        name: editName,
        description: editDescription,
      });
      
      // If in rename flow, show confirmation modal
      if (pendingWorkoutInfo) {
        setShowConfirmAddModal(true);
      }
      setEditingWorkout(null);
    }
  };

  // Handle confirming add workout after rename
  const handleConfirmAddWorkout = () => {
    if (!pendingWorkoutInfo) return;
    
    const workoutToAdd = workouts.find(w => w.id === pendingWorkoutInfo.id);
    if (!workoutToAdd) return;
    
    // Check if name still conflicts
    const stillConflicts = savedWorkouts.find(w => w.name === workoutToAdd.name);
    if (stillConflicts) {
      // Still conflicts - user will need to go back and rename again
      // For now, just close and let home screen handle it
      setShowConfirmAddModal(false);
      setPendingWorkoutInfo(null);
      clearWorkoutEditState();
      return;
    }
    
    // Add the workout
    addWorkout({
      originalId: workoutToAdd.id,
      name: workoutToAdd.name,
      description: workoutToAdd.description,
      exercises: [...workoutToAdd.exercises],
    });

    // Close and clear
    setShowConfirmAddModal(false);
    setPendingWorkoutInfo(null);
    clearWorkoutEditState();
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (editingWorkout) {
      Alert.alert(
        'Remove Exercise',
        'Are you sure you want to remove this exercise from the workout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => {
              removeExerciseFromWorkout(editingWorkout.id, exerciseId);
              // Update local state
              setEditingWorkout({
                ...editingWorkout,
                exercises: editingWorkout.exercises.filter(e => e !== exerciseId)
              });
            }
          }
        ]
      );
    }
  };

  const handleAddExerciseFromEditPage = () => {
    setShowExerciseSelectionModal(true);
    setExerciseSearchText('');
  };

  const handleSelectExerciseFromList = (exerciseId: string, exerciseName: string) => {
    if (!editingWorkout) return;

    if (editingWorkout.exercises.length >= MAX_EXERCISES) {
      Alert.alert('Limit reached', 'You can only have 12 exercises per workout.');
      return;
    }

    // Check for duplicate
    if (editingWorkout.exercises.includes(exerciseId)) {
      Alert.alert('This exercise is already in this workout', '', [{ text: 'OK' }]);
      return;
    }

    // Add exercise to workout
    const updatedExercises = [...editingWorkout.exercises, exerciseId];
    setEditingWorkout({
      ...editingWorkout,
      exercises: updatedExercises
    });

    // Also update the store
    updateWorkout(editingWorkout.id, {
      exercises: updatedExercises
    });

    // Close the modal
    setShowExerciseSelectionModal(false);
    setExerciseSearchText('');
  };

  const promptRemoveSavedExercise = (exercise: { id: string; name: string }, options?: { closeMenu?: boolean; closeDetail?: boolean }) => {
    Alert.alert(
      'Remove Exercise',
      `Remove "${exercise.name}" from saved exercises?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeExercise(exercise.id);
            if (options?.closeMenu) {
              setMenuExercise(null);
            }
            if (options?.closeDetail) {
              setDetailExercise(null);
            }
          },
        },
      ]
    );
  };

  const handleRemoveFromSaved = () => {
    if (menuWorkout) {
      Alert.alert(
        'Remove Workout',
        `Are you sure you want to remove "${menuWorkout.name}" from your saved workouts?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => {
              removeWorkout(menuWorkout.id);
              setMenuWorkout(null);
            }
          }
        ]
      );
    }
  };

  const exerciseNameById = useMemo(() => {
    const names = new Map<string, string>();

    // 1) Built-in exercises by id
    allExercises.forEach(exercise => {
      names.set(exercise.id, exercise.name);
    });

    // 2) Custom exercises by id
    customExercises.forEach(exercise => {
      if (!names.has(exercise.id)) {
        names.set(exercise.id, exercise.name);
      }
    });

    // 3) Saved exercises by originalId (fallback mapping path)
    savedExercises.forEach(exercise => {
      if (exercise.originalId && !names.has(exercise.originalId)) {
        names.set(exercise.originalId, exercise.name);
      }
    });

    return names;
  }, [customExercises, savedExercises]);

  const getExerciseName = (exerciseId: string) => {
    if (!hasHydrated) return exerciseId;
    return exerciseNameById.get(exerciseId) || exerciseId;
  };

  const handleFilterChange = (filter: SavedFilter) => {
    setSelectedFilter(filter);
    setSelectedWorkoutIds([]);
    setSelectedExerciseIds([]);
  };

  const handleToggleEditMode = () => {
    const turningOff = isEditMode;
    setIsEditMode(!isEditMode);
    if (turningOff) {
      setSelectedWorkoutIds([]);
      setSelectedExerciseIds([]);
    }
    setMenuWorkout(null);
    setMenuExercise(null);
  };

  const toggleWorkoutSelection = (workoutId: string) => {
    setSelectedWorkoutIds(prev =>
      prev.includes(workoutId) ? prev.filter(id => id !== workoutId) : [...prev, workoutId]
    );
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExerciseIds(prev =>
      prev.includes(exerciseId) ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId]
    );
  };

  const selectedCount = selectedFilter === 'workouts' ? selectedWorkoutIds.length : selectedExerciseIds.length;

  const handleConfirmBulkRemove = () => {
    if (selectedFilter === 'workouts') {
      selectedWorkoutIds.forEach(workoutId => removeWorkout(workoutId));
      setSelectedWorkoutIds([]);
    } else {
      selectedExerciseIds.forEach(exerciseId => removeExercise(exerciseId));
      setSelectedExerciseIds([]);
    }

    setShowBulkRemoveConfirmModal(false);
  };

  // Sort workouts by order
  const sortedWorkouts = [...savedWorkouts].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved</Text>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <View style={styles.filterButtonsGroup}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'workouts' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('workouts')}>
            <Text style={[styles.filterText, selectedFilter === 'workouts' && styles.filterTextActive]}>
              Workouts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'exercises' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('exercises')}>
            <Text style={[styles.filterText, selectedFilter === 'exercises' && styles.filterTextActive]}>
              Exercises
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.editModeButton, isEditMode && styles.editModeButtonActive]}
          onPress={handleToggleEditMode}>
          <Ionicons name="pencil-outline" size={14} color={isEditMode ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      {isEditMode && selectedCount > 0 && (
        <TouchableOpacity style={styles.bulkRemoveButton} onPress={() => setShowBulkRemoveConfirmModal(true)}>
          <Text style={styles.bulkRemoveButtonText}>Remove ({selectedCount})</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {selectedFilter === 'workouts' && sortedWorkouts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved workouts yet</Text>
          </View>
        )}

        {selectedFilter === 'workouts' && sortedWorkouts.map((workout, index) => {
          return (
          <View key={workout.id} style={styles.listItem}>
            <TouchableOpacity 
              style={styles.workoutContent}
              onPress={() => setDetailWorkout(workout)}>
              <Text style={styles.listItemText}>{workout.name}</Text>
              <Text style={styles.listItemDescription}>{workout.description}</Text>
            </TouchableOpacity>
            
            {isEditMode ? (
              <TouchableOpacity
                style={[
                  styles.selectionControl,
                  selectedWorkoutIds.includes(workout.id) && styles.selectionControlSelected,
                ]}
                onPress={() => toggleWorkoutSelection(workout.id)}>
                <Text
                  style={[
                    styles.selectionControlMinus,
                    selectedWorkoutIds.includes(workout.id) && styles.selectionControlMinusSelected,
                  ]}>
                  -
                </Text>
              </TouchableOpacity>
            ) : (
              /* 3-dot menu button */
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handleOpenMenu(workout)}>
                <Text style={styles.menuButtonText}>⋯</Text>
              </TouchableOpacity>
            )}
          </View>
          );
        })}

        {selectedFilter === 'exercises' && savedExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved exercises yet</Text>
          </View>
        )}

        {selectedFilter === 'exercises' && savedExercises.map(exercise => (
          <View key={exercise.id} style={styles.listItem}>
            <TouchableOpacity 
              style={styles.workoutContent}
              onPress={() => setDetailExercise({ id: exercise.id, name: exercise.name, description: exercise.description ?? '', originalId: exercise.originalId })}>
              <Text style={styles.listItemText}>{exercise.name}</Text>
            </TouchableOpacity>
            {isEditMode ? (
              <TouchableOpacity
                style={[
                  styles.selectionControl,
                  selectedExerciseIds.includes(exercise.id) && styles.selectionControlSelected,
                ]}
                onPress={() => toggleExerciseSelection(exercise.id)}>
                <Text
                  style={[
                    styles.selectionControlMinus,
                    selectedExerciseIds.includes(exercise.id) && styles.selectionControlMinusSelected,
                  ]}>
                  -
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handleOpenExerciseMenu({ id: exercise.id, name: exercise.name, originalId: exercise.originalId })}>
                <Text style={styles.menuButtonText}>⋯</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 3-dot Menu Modal for Workouts */}
      <Modal
        visible={menuWorkout !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuWorkout(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuModalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => setMenuWorkout(null)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.menuModalTitle}>{menuWorkout?.name}</Text>
            
            <TouchableOpacity style={styles.menuOption} onPress={handleEdit}>
              <Text style={styles.menuOptionText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuOptionDanger} onPress={handleRemoveFromSaved}>
              <Text style={styles.menuOptionDangerText}>Remove from Saved</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3-dot Menu Modal for Exercises */}
      <Modal
        visible={menuExercise !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuExercise(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuModalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => setMenuExercise(null)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.menuModalTitle}>{menuExercise?.name}</Text>
            
            <TouchableOpacity style={styles.menuOption} onPress={handleAddExerciseToWorkout}>
              <Text style={styles.menuOptionText}>Add to Existing Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOptionDanger}
              onPress={() => {
                if (!menuExercise) return;
                promptRemoveSavedExercise(menuExercise, { closeMenu: true });
              }}>
              <Text style={styles.menuOptionDangerText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBulkRemoveConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBulkRemoveConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuModalContent}>
            <Text style={styles.menuModalTitle}>Confirm removal</Text>
            <Text style={styles.modalDescription}>Are you sure you want to remove {selectedCount} saved {selectedFilter === 'workouts' ? 'workout' : 'exercise'}{selectedCount === 1 ? '' : 's'}?</Text>

            <TouchableOpacity style={styles.menuOptionDanger} onPress={handleConfirmBulkRemove}>
              <Text style={styles.menuOptionDangerText}>Remove ({selectedCount})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => setShowBulkRemoveConfirmModal(false)}>
              <Text style={styles.menuOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Selection Modal for adding exercise */}
      <Modal
        visible={showWorkoutSelectionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowWorkoutSelectionModal(false);
          setExerciseToAdd(null);
          setExerciseNameToAdd(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => {
                setShowWorkoutSelectionModal(false);
                setExerciseToAdd(null);
                setExerciseNameToAdd(null);
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add {exerciseNameToAdd} to Workout
            </Text>
            <ScrollView style={styles.workoutSelectionList}>
              {savedWorkouts.map(workout => (
                <TouchableOpacity 
                  key={workout.id}
                  style={styles.workoutSelectionItem}
                  onPress={() => handleWorkoutSelectionForExercise(workout.id, workout.name)}>
                  <Text style={styles.workoutSelectionText}>{workout.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowWorkoutSelectionModal(false);
                setExerciseToAdd(null);
                setExerciseNameToAdd(null);
              }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Detail Modal */}
      <Modal
        visible={detailWorkout !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailWorkout(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.workoutDetailModalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => setDetailWorkout(null)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{detailWorkout?.name}</Text>
            <Text style={styles.modalDescription}>{detailWorkout?.description}</Text>
            
            <Text style={styles.exercisesHeader}>Exercises</Text>
            <ScrollView style={styles.exercisesList}>
              {detailWorkout?.exercises.map((exerciseId, index) => (
                <View key={exerciseId || index} style={styles.exerciseListItem}>
                  <Text style={styles.exerciseListText}>{getExerciseName(exerciseId)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Workout Full-Screen Modal */}
      <Modal
        visible={editingWorkout !== null}
        animationType="slide"
        onRequestClose={() => setEditingWorkout(null)}>
        <View style={styles.editContainer}>
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => setEditingWorkout(null)}>
              <Text style={styles.editCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editTitle}>Edit Workout</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.editSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editContent}>
            <Text style={styles.editLabel}>Name</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor="#666"
            />

            <Text style={styles.editLabel}>Description</Text>
            <TextInput
              style={[styles.editInput, styles.editInputMultiline]}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#666"
            />

            <TouchableOpacity 
              style={styles.addExerciseButton}
              onPress={handleAddExerciseFromEditPage}>
              <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>

            <Text style={styles.editLabel}>Exercises</Text>
            {editingWorkout?.exercises.map(exerciseId => (
              <View key={exerciseId} style={styles.editExerciseItem}>
                <Text style={styles.editExerciseText}>{getExerciseName(exerciseId)}</Text>
                <TouchableOpacity 
                  style={styles.removeExerciseButton}
                  onPress={() => handleRemoveExercise(exerciseId)}>
                  <Text style={styles.removeExerciseText}>−</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Exercise Selection Modal for Edit Page - nested inside Edit Modal to render correctly on top */}
          <Modal
            visible={showExerciseSelectionModal}
            animationType="slide"
            onRequestClose={() => {
              setShowExerciseSelectionModal(false);
              setExerciseSearchText('');
            }}>
            <View style={styles.editContainer}>
              <View style={styles.editHeader}>
                <TouchableOpacity onPress={() => {
                  setShowExerciseSelectionModal(false);
                  setExerciseSearchText('');
                }}>
                  <Text style={styles.editCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.editTitle}>Add Exercise</Text>
                <View style={{ width: 50 }} />
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#666"
                value={exerciseSearchText}
                onChangeText={setExerciseSearchText}
              />

              <FlatList
                data={(() => {
                  // Filter exercises based on search text
                  const filteredAllExercises = allExercises.filter(e =>
                    e.name.toLowerCase().includes(exerciseSearchText.toLowerCase())
                  );

                  // Get saved exercises
                  const savedExerciseIds = savedExercises.map(se => se.originalId);

                  // Split into saved and all
                  const savedInList = filteredAllExercises.filter(e =>
                    savedExerciseIds.includes(e.id)
                  );
                  const allInList = filteredAllExercises.filter(e =>
                    !savedExerciseIds.includes(e.id)
                  );

                  // Create sections
                  type ExerciseListEntry =
                    | { type: 'header'; title: string; data: never[] }
                    | { type: 'item'; exerciseId: string; exerciseName: string; isSaved: boolean };
                  const sections: ExerciseListEntry[] = [];

                  if (savedInList.length > 0) {
                    sections.push({ type: 'header', title: 'Saved', data: [] });
                    savedInList.forEach(e => {
                      sections.push({ type: 'item', exerciseId: e.id, exerciseName: e.name, isSaved: true });
                    });
                  }

                  if (allInList.length > 0) {
                    sections.push({ type: 'header', title: 'All Exercises', data: [] });
                    allInList.forEach(e => {
                      sections.push({ type: 'item', exerciseId: e.id, exerciseName: e.name, isSaved: false });
                    });
                  }

                  return sections;
                })()}
                keyExtractor={(item, index) => {
                  if (item.type === 'header') {
                    return `header-${item.title}-${index}`;
                  }
                  return item.exerciseId;
                }}
                renderItem={({ item }) => {
                  if (item.type === 'header') {
                    return (
                      <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionHeader}>{item.title}</Text>
                      </View>
                    );
                  }
                  return (
                    <TouchableOpacity
                      style={styles.exerciseSelectionItem}
                      onPress={() => handleSelectExerciseFromList(item.exerciseId, item.exerciseName)}>
                      <Text style={styles.exerciseSelectionText}>{item.exerciseName}</Text>
                      {item.isSaved && (
                        <Text style={styles.savedBadge}>★</Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No exercises found</Text>
                  </View>
                }
                contentContainerStyle={styles.exerciseListContent}
              />
            </View>
          </Modal>
        </View>
      </Modal>

      {/* Saved Exercise Detail Modal */}
      <Modal
        visible={detailExercise !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailExercise(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeX}
              onPress={() => setDetailExercise(null)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{detailExercise?.name}</Text>
            <Text style={styles.modalDescription}>
              {detailExercise?.description || 'No description provided.'}
            </Text>
            <TouchableOpacity
              style={styles.addToExistingWorkoutButton}
              onPress={() => {
                if (!detailExercise) return;
                handleOpenAddToWorkout(detailExercise, { closeDetail: true });
              }}>
              <Text style={styles.addToExistingWorkoutButtonText}>Add to Existing Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeFromSavedButton}
              onPress={() => {
                if (!detailExercise) return;
                promptRemoveSavedExercise(detailExercise, { closeDetail: true });
              }}>
              <Text style={styles.removeFromSavedButtonText}>Remove from Saved Exercises</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Add Workout Modal */}
      <Modal
        visible={showConfirmAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmAddModal(false);
          setPendingWorkoutInfo(null);
          clearWorkoutEditState();
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeX}
              onPress={() => {
                setShowConfirmAddModal(false);
                setPendingWorkoutInfo(null);
                clearWorkoutEditState();
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ready to Add</Text>
            <Text style={styles.modalDescription}>
              Still want to add &ldquo;{pendingWorkoutInfo?.name}&rdquo;?
            </Text>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleConfirmAddWorkout}>
              <Text style={styles.optionButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowConfirmAddModal(false);
                setPendingWorkoutInfo(null);
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
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtonsGroup: {
    flexDirection: 'row',
    gap: 8,
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
  editModeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editModeButtonActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  bulkRemoveButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  bulkRemoveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  workoutContent: {
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
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  selectionControl: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#d32f2f',
    backgroundColor: 'rgba(211, 47, 47, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionControlSelected: {
    backgroundColor: '#d32f2f',
  },
  selectionControlMinus: {
    color: '#d32f2f',
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '700',
  },
  selectionControlMinusSelected: {
    color: '#b0b0b0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    position: 'relative',
  },
  workoutDetailModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxHeight: '80%',
    position: 'relative',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    paddingRight: 30,
  },
  modalDescription: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
  exercisesHeader: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  exercisesList: {
    maxHeight: 300,
  },
  exerciseListItem: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseListText: {
    color: '#fff',
    fontSize: 14,
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
  menuModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 8,
    paddingRight: 30,
  },
  menuOption: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  menuOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  menuOptionDanger: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
  },
  menuOptionDangerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Edit Modal Styles
  editContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  editCancelText: {
    color: '#888',
    fontSize: 16,
  },
  editTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  editSaveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editContent: {
    flex: 1,
    padding: 16,
  },
  editLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  editInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addExerciseButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  addExerciseButtonText: {
    color: '#888',
    fontSize: 16,
  },
  editExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  editExerciseText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  removeExerciseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeExerciseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  // Modal Styles for Confirm Add
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
    position: 'relative',
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
  // Exercise Selection Modal Styles
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    margin: 16,
    marginBottom: 8,
  },
  sectionHeaderContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  exerciseSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  exerciseSelectionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  savedBadge: {
    color: '#ffd700',
    fontSize: 14,
    marginLeft: 8,
  },
  exerciseListContent: {
    paddingBottom: 20,
  },
  addToExistingWorkoutButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  addToExistingWorkoutButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  removeFromSavedButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 0,
  },
  removeFromSavedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
