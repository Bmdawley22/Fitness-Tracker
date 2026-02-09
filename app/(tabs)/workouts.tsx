import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { useSavedWorkoutsStore, SavedWorkout } from '@/store/savedWorkouts';
import { exercises as allExercises } from '@/data/exercises';

type SavedFilter = 'workouts' | 'exercises';

export default function SavedScreen() {
  const [selectedFilter, setSelectedFilter] = useState<SavedFilter>('workouts');
  const [menuWorkout, setMenuWorkout] = useState<SavedWorkout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<SavedWorkout | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { 
    savedWorkouts, 
    savedExercises, 
    removeWorkout, 
    updateWorkout,
    removeExerciseFromWorkout,
    reorderWorkouts 
  } = useSavedWorkoutsStore();

  const handleOpenMenu = (workout: SavedWorkout) => {
    setMenuWorkout(workout);
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
      updateWorkout(editingWorkout.id, {
        name: editName,
        description: editDescription,
      });
      setEditingWorkout(null);
    }
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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...savedWorkouts];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderWorkouts(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === savedWorkouts.length - 1) return;
    const newOrder = [...savedWorkouts];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderWorkouts(newOrder);
  };

  const getExerciseName = (exerciseId: string) => {
    return allExercises.find(e => e.id === exerciseId)?.name || exerciseId;
  };

  // Sort workouts by order
  const sortedWorkouts = [...savedWorkouts].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved</Text>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
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
        {selectedFilter === 'workouts' && sortedWorkouts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved workouts yet</Text>
          </View>
        )}

        {selectedFilter === 'workouts' && sortedWorkouts.map((workout, index) => (
          <View key={workout.id} style={styles.listItem}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <TouchableOpacity 
                style={styles.moveButton}
                onPress={() => handleMoveUp(index)}
                disabled={index === 0}>
                <Text style={[styles.moveButtonText, index === 0 && styles.moveButtonDisabled]}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.dragHandle}>☰</Text>
              <TouchableOpacity 
                style={styles.moveButton}
                onPress={() => handleMoveDown(index)}
                disabled={index === sortedWorkouts.length - 1}>
                <Text style={[styles.moveButtonText, index === sortedWorkouts.length - 1 && styles.moveButtonDisabled]}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.workoutContent}>
              <Text style={styles.listItemText}>{workout.name}</Text>
              <Text style={styles.listItemDescription}>{workout.description}</Text>
            </View>
            
            {/* 3-dot menu button */}
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => handleOpenMenu(workout)}>
              <Text style={styles.menuButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>
        ))}

        {selectedFilter === 'exercises' && savedExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved exercises yet</Text>
          </View>
        )}

        {selectedFilter === 'exercises' && savedExercises.map(exercise => (
          <View key={exercise.id} style={styles.listItem}>
            <View style={styles.workoutContent}>
              <Text style={styles.listItemText}>{exercise.name}</Text>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 3-dot Menu Modal */}
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

            <TouchableOpacity style={styles.addExerciseButton}>
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
  dragHandleContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  dragHandle: {
    color: '#666',
    fontSize: 16,
  },
  moveButton: {
    padding: 4,
  },
  moveButtonText: {
    color: '#888',
    fontSize: 10,
  },
  moveButtonDisabled: {
    color: '#333',
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
});
