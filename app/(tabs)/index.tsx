import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, TextInput, Pressable, Linking } from 'react-native';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';
import { useExerciseCatalogStore } from '@/store/exerciseCatalog';
import { useAuthStore } from '@/store/auth';
import { CreateFlowHandle, CreateFlowModals } from './add';

type FilterType = 'all' | 'workouts' | 'exercises';

type ExerciseLike = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipment?: string;
  instructions?: string;
  image?: string;
};

const resolveMuscleGroups = (exercise: ExerciseLike): string[] => {
  const primary = Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles.filter(Boolean) : [];
  if (primary.length > 0) return primary;
  if (exercise.category) return [exercise.category];
  return ['Other'];
};

export default function HomeScreen() {
  const {
    savedWorkouts,
    addExerciseToWorkout,
    addExercise,
    isExerciseSaved,
    customExercises,
    savedExercises,
  } = useSavedWorkoutsStore();
  const { seededExercises, hasHydrated: catalogHydrated, runSeedIfNeeded } = useExerciseCatalogStore();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('exercises');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedExerciseGroups, setSelectedExerciseGroups] = useState<string[]>(['All']);
  const [exerciseSearchText, setExerciseSearchText] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [isExerciseInstructionsExpanded, setIsExerciseInstructionsExpanded] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<string | null>(null);
  const [showWorkoutSelectionModal, setShowWorkoutSelectionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const createFlowRef = useRef<CreateFlowHandle>(null);
  const signOut = useAuthStore(state => state.signOut);
  const router = useRouter();

  useEffect(() => {
    if (catalogHydrated) {
      runSeedIfNeeded();
    }
  }, [catalogHydrated, runSeedIfNeeded]);

  const availableSeededExercises = useMemo(() => (catalogHydrated ? seededExercises : []), [catalogHydrated, seededExercises]);

  const homeExercises = useMemo(() => [...availableSeededExercises, ...customExercises], [availableSeededExercises, customExercises]);

  const exerciseLookup = useMemo(() => {
    const map = new Map<string, ExerciseLike>();
    availableSeededExercises.forEach(exercise => {
      map.set(exercise.id, exercise);
    });
    customExercises.forEach(exercise => {
      map.set(exercise.id, exercise);
    });
    savedExercises.forEach(exercise => {
      map.set(exercise.id, exercise);
      if (exercise.originalId) {
        map.set(exercise.originalId, exercise);
      }
    });
    return map;
  }, [availableSeededExercises, customExercises, savedExercises]);

  const exerciseGroups = useMemo(() => {
    const uniqueGroups = new Set<string>();
    homeExercises.forEach(exercise => {
      resolveMuscleGroups(exercise).forEach(group => {
        uniqueGroups.add(group);
      });
    });
    const groups = Array.from(uniqueGroups);
    groups.sort((a, b) => a.localeCompare(b));
    return ['All', ...groups];
  }, [homeExercises]);

  useEffect(() => {
    if (selectedFilter !== 'exercises') {
      setSelectedExerciseGroups(['All']);
    }
  }, [selectedFilter]);

  const filteredExercises = useMemo(() => {
    if (selectedFilter !== 'exercises') return [];

    const isAllSelected = selectedExerciseGroups.includes('All');

    let list = isAllSelected
      ? homeExercises
      : homeExercises.filter(exercise => {
          const groups = resolveMuscleGroups(exercise);
          return groups.some(group => selectedExerciseGroups.includes(group));
        });

    if (exerciseSearchText.trim()) {
      const term = exerciseSearchText.trim().toLowerCase();
      list = list.filter(exercise => {
        const haystack = `${exercise.name} ${exercise.description ?? ''} ${resolveMuscleGroups(exercise).join(' ')}`.toLowerCase();
        return haystack.includes(term);
      });
    }

    return list;
  }, [selectedFilter, selectedExerciseGroups, homeExercises, exerciseSearchText]);

  // Show toast for a few seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addExerciseToSavedById = (exerciseId: string) => {
    const exercise = exerciseLookup.get(exerciseId);
    if (!exercise) return false;

    if (isExerciseSaved(exerciseId)) {
      Alert.alert('Already Saved', `"${exercise.name}" is already in your saved exercises.`);
      return false;
    }

    const success = addExercise({
      originalId: exercise.id,
      name: exercise.name,
      description: exercise.description ?? '',
      category: exercise.category ?? 'Other',
      primaryMuscles: exercise.primaryMuscles ?? [],
      secondaryMuscles: exercise.secondaryMuscles ?? [],
      equipment: exercise.equipment,
      instructions: exercise.instructions,
      image: exercise.image,
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

    if (savedWorkouts.length === 0) {
      Alert.alert('You have no Saved Workouts', 'OK');
      setExerciseToAdd(null);
      return;
    }

    setShowWorkoutSelectionModal(true);
  };

  const handleWorkoutSelection = (workoutId: string, workoutName: string) => {
    if (!exerciseToAdd) return;

    const workout = savedWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    if (workout.exercises.includes(exerciseToAdd)) {
      Alert.alert(`This exercise is already in ${workoutName}`, 'OK');
      setShowWorkoutSelectionModal(false);
      setExerciseToAdd(null);
      return;
    }

    Alert.alert(
      `Save to ${workoutName}?`,
      'Add this exercise to your workout',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {
          setShowWorkoutSelectionModal(false);
          setExerciseToAdd(null);
        }},
        { text: 'Save', onPress: () => {
          const success = addExerciseToWorkout(workoutId, exerciseToAdd);
          if (success) {
            setToastMessage(`Exercise added to ${workoutName}!`);
          } else {
            Alert.alert('Limit reached', 'You can only add 12 exercises to a workout.');
          }
          setTimeout(() => {
            setShowWorkoutSelectionModal(false);
            setExerciseToAdd(null);
          }, 1000);
        }}
      ]
    );
  };

  const selectedExerciseData = selectedExercise
    ? exerciseLookup.get(selectedExercise)
    : null;

  const selectedWorkoutData = selectedWorkout
    ? savedWorkouts.find(w => w.id === selectedWorkout)
    : null;

  const exerciseToAddData = exerciseToAdd
    ? exerciseLookup.get(exerciseToAdd)
    : null;

  useEffect(() => {
    setIsExerciseInstructionsExpanded(false);
  }, [selectedExercise]);

  const handleOpenExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) return;
      await Linking.openURL(url);
    } catch {
      // no-op
    }
  };

  const getWorkoutExercises = (exerciseIds: string[]) => {
    return exerciseIds
      .map(id => exerciseLookup.get(id))
      .filter(Boolean);
  };

  const openWorkoutCreateFlow = () => {
    setShowQuickCreateModal(false);
    createFlowRef.current?.openCreateWorkout();
  };

  const openExerciseCreateFlow = () => {
    setShowQuickCreateModal(false);
    createFlowRef.current?.openCreateExercise();
  };

  const sortedSavedWorkouts = useMemo(() => [...savedWorkouts].sort((a, b) => a.order - b.order), [savedWorkouts]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Home</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutConfirmModal(true)}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <View style={styles.filterButtonsRow}>
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

        <TouchableOpacity
          style={styles.quickCreateButton}
          onPress={() => setShowQuickCreateModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Open quick create menu">
          <Text style={styles.quickCreateButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {selectedFilter === 'exercises' && (
        <>
          <View style={styles.categoryFilterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilterScroll}>
              {exerciseGroups.map(group => {
                const isAll = group === 'All';
                const isActive = isAll
                  ? selectedExerciseGroups.includes('All')
                  : selectedExerciseGroups.includes(group);

                return (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.categoryFilterButton,
                      isActive && styles.categoryFilterButtonActive,
                    ]}
                    onPress={() => {
                      if (isAll) {
                        setSelectedExerciseGroups(['All']);
                        return;
                      }

                      setSelectedExerciseGroups(prev => {
                        const withoutAll = prev.filter(item => item !== 'All');
                        const alreadySelected = withoutAll.includes(group);
                        const next = alreadySelected
                          ? withoutAll.filter(item => item !== group)
                          : [...withoutAll, group];
                        return next.length === 0 ? ['All'] : next;
                      });
                    }}>
                    <Text
                      style={[
                        styles.categoryFilterText,
                        isActive && styles.categoryFilterTextActive,
                      ]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#666"
              value={exerciseSearchText}
              onChangeText={setExerciseSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </>
      )}

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {selectedFilter === 'exercises' && (
          filteredExercises.length === 0 ? (
            <Text style={styles.noExercisesText}>No exercises found in {
              selectedExerciseGroups.includes('All')
                ? 'this list'
                : selectedExerciseGroups.join(', ')
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

        {selectedFilter === 'workouts' && (
          sortedSavedWorkouts.length === 0 ? (
            <Text style={styles.noExercisesText}>No saved workouts yet.</Text>
          ) : (
            sortedSavedWorkouts.map(workout => (
              <View key={workout.id} style={styles.listItem}>
                <TouchableOpacity 
                  style={styles.listItemButton}
                  onPress={() => setSelectedWorkout(workout.id)}>
                  <View>
                    <Text style={styles.listItemText}>{workout.name}</Text>
                    <Text style={styles.listItemDescription}>{workout.description}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Toast */}
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <Modal
        visible={showQuickCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuickCreateModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowQuickCreateModal(false)}>
          <Pressable style={styles.quickCreateModalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Create New:</Text>
            <TouchableOpacity style={styles.optionButton} onPress={openWorkoutCreateFlow}>
              <Text style={styles.optionButtonText}>Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={openExerciseCreateFlow}>
              <Text style={styles.optionButtonText}>Exercise</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <CreateFlowModals ref={createFlowRef} />

      {/* Exercise Detail Modal */}
      <Modal
        visible={selectedExercise !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedExercise(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.exerciseInfoModalContent}>
            <TouchableOpacity
              style={styles.closeX}
              onPress={() => setSelectedExercise(null)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>

            {selectedExerciseData?.name ? <Text style={styles.exerciseInfoHeaderTitle}>{selectedExerciseData.name}</Text> : null}

            <ScrollView style={styles.exerciseInfoScroll} contentContainerStyle={styles.exerciseInfoScrollContent}>

              {selectedExerciseData?.description ? (
                <>
                  <Text style={styles.exerciseSectionTitle}>Description</Text>
                  <Text style={styles.modalDescription}>{selectedExerciseData.description}</Text>
                </>
              ) : null}

              {selectedExerciseData?.instructions ? (
                <TouchableOpacity
                  style={styles.instructionsSection}
                  activeOpacity={0.85}
                  onPress={() => setIsExerciseInstructionsExpanded(prev => !prev)}>
                  <View style={styles.instructionsHeaderRow}>
                    <Text style={styles.exerciseSectionTitle}>Instructions</Text>
                    <Text style={styles.instructionsChevron}>{isExerciseInstructionsExpanded ? '▴' : '▾'}</Text>
                  </View>
                  <Text
                    style={styles.modalDescription}
                    numberOfLines={isExerciseInstructionsExpanded ? undefined : 1}
                    ellipsizeMode="tail">
                    {selectedExerciseData.instructions}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {Array.isArray(selectedExerciseData?.primaryMuscles) && selectedExerciseData.primaryMuscles.filter(Boolean).length > 0 ? (
                <>
                  <Text style={styles.exerciseSectionTitle}>Primary muscle groups</Text>
                  <Text style={styles.modalDescription}>{selectedExerciseData.primaryMuscles.filter(Boolean).join(', ')}</Text>
                </>
              ) : null}

              {Array.isArray(selectedExerciseData?.secondaryMuscles) && selectedExerciseData.secondaryMuscles.filter(Boolean).length > 0 ? (
                <>
                  <Text style={styles.exerciseSectionTitle}>Secondary muscle groups</Text>
                  <Text style={styles.modalDescription}>{selectedExerciseData.secondaryMuscles.filter(Boolean).join(', ')}</Text>
                </>
              ) : null}

              {selectedExerciseData?.image ? (
                <>
                  <Text style={styles.exerciseSectionTitle}>Exercise image</Text>
                  <TouchableOpacity onPress={() => selectedExerciseData.image && handleOpenExternalLink(selectedExerciseData.image)}>
                    <Text style={styles.exerciseLinkText}>{selectedExerciseData.image}</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </ScrollView>

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
            <View style={styles.workoutModalHeader}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.modalTitle}>{selectedWorkoutData?.name}</Text>
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

      <Modal
        visible={showLogoutConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalDescription}>Are you sure you want to log out?</Text>
            <View style={styles.logoutActionsRow}>
              <TouchableOpacity style={styles.logoutCancelButton} onPress={() => setShowLogoutConfirmModal(false)}>
                <Text style={styles.logoutCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={() => {
                  setShowLogoutConfirmModal(false);
                  signOut();
                  router.replace('/auth-entry');
                }}>
                <Text style={styles.logoutConfirmButtonText}>Confirm Logout</Text>
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
    paddingTop: 60,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  quickCreateButton: {
    minWidth: 72,
    height: 34,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2CD66F',
    backgroundColor: '#2CD66F',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 10,
  },
  quickCreateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  categoryFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchContainer: {
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
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
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
  quickCreateModalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxHeight: '55%',
  },
  workoutModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  exerciseInfoModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '85%',
    position: 'relative',
  },
  exerciseInfoHeaderTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
    marginTop: 8,
    paddingRight: 36,
  },
  exerciseInfoScroll: {
    maxHeight: '70%',
  },
  exerciseInfoScrollContent: {
    paddingBottom: 8,
    paddingRight: 14,
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
  exerciseSectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionsSection: {
    marginBottom: 4,
  },
  instructionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 14,
  },
  instructionsChevron: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 10,
    marginRight: 8,
    lineHeight: 24,
  },
  exerciseLinkText: {
    color: '#5ca9ff',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 14,
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
  logoutModalContent: {
    width: '88%',
    maxWidth: 360,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    gap: 12,
  },
  logoutActionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  logoutCancelButton: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logoutCancelButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  logoutConfirmButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logoutConfirmButtonText: {
    color: '#000',
    fontWeight: '700',
  },
});
