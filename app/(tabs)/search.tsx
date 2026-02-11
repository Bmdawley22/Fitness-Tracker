import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { exercises } from '@/data/exercises';
import { useSavedWorkoutsStore } from '@/store/savedWorkouts';
import { toLocalDateKey, useScheduleStore, WEEK_DAYS } from '@/store/schedule';
import { Ionicons } from '@expo/vector-icons';

type WorkoutOption = {
  id: string;
  name: string;
  description: string;
  exercises: string[];
};

const CALENDAR_WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const normalized = normalizeDate(date);
  const dayOfWeek = normalized.getDay();

  const start = new Date(normalized.getFullYear(), normalized.getMonth(), normalized.getDate() - dayOfWeek);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);

  return { start, end };
};

const formatShortDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear() % 100;
  return `${month}/${day}/${year.toString().padStart(2, '0')}`;
};

export default function SearchScreen() {
  const { savedWorkouts, savedExercises, customExercises, hasHydrated: savedHydrated } = useSavedWorkoutsStore();
  const {
    schedule,
    assignWorkoutToDate,
    clearDateAssignment,
    cleanupInvalidAssignments,
    hasHydrated: scheduleHydrated,
  } = useScheduleStore();

  const [assignmentDateKey, setAssignmentDateKey] = useState<string | null>(null);
  const [assignmentDateLabel, setAssignmentDateLabel] = useState<string | null>(null);
  const [detailWorkoutId, setDetailWorkoutId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => normalizeDate(new Date()));
  const [viewingMonth, setViewingMonth] = useState(() => {
    const today = normalizeDate(new Date());
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const workoutOptions = useMemo<WorkoutOption[]>(() => {
    return savedWorkouts.map(workout => ({
      id: workout.id,
      name: workout.name,
      description: workout.description,
      exercises: workout.exercises,
    }));
  }, [savedWorkouts]);

  const workoutById = useMemo(() => {
    const map = new Map<string, WorkoutOption>();
    workoutOptions.forEach(workout => {
      map.set(workout.id, workout);
    });
    return map;
  }, [workoutOptions]);

  const exerciseById = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();

    exercises.forEach(exercise => {
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
  }, [savedExercises, customExercises]);

  const detailWorkout = detailWorkoutId ? workoutById.get(detailWorkoutId) : null;
  const weekRange = useMemo(() => getWeekRange(selectedDate), [selectedDate]);
  const weekDates = useMemo(
    () =>
      WEEK_DAYS.map((day, index) => {
        const date = new Date(weekRange.start.getFullYear(), weekRange.start.getMonth(), weekRange.start.getDate() + index);
        return { day, date, dateKey: toLocalDateKey(date) };
      }),
    [weekRange.start],
  );
  const weekRangeLabel = `${formatShortDate(weekRange.start)} - ${formatShortDate(weekRange.end)}`;
  const todayWeekRange = useMemo(() => getWeekRange(normalizeDate(new Date())), []);
  const isCurrentWeek =
    weekRange.start.getFullYear() === todayWeekRange.start.getFullYear() &&
    weekRange.start.getMonth() === todayWeekRange.start.getMonth() &&
    weekRange.start.getDate() === todayWeekRange.start.getDate();
  const weekTitleLine = `${isCurrentWeek ? 'Current Week' : 'Week'}: ${weekRangeLabel}`;
  const calendarMonthLabel = `${MONTH_NAMES[viewingMonth.getMonth()]} ${viewingMonth.getFullYear()}`;
  const daysInMonth = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth(), 1).getDay();
  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDayOfMonth; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [firstDayOfMonth, daysInMonth]);
  const detailExercises = useMemo(() => {
    if (!detailWorkout) return [];
    return detailWorkout.exercises
      .map(exerciseId => exerciseById.get(exerciseId))
      .filter((exercise): exercise is { id: string; name: string } => Boolean(exercise));
  }, [detailWorkout, exerciseById]);

  useEffect(() => {
    if (!savedHydrated || !scheduleHydrated) return;
    cleanupInvalidAssignments(savedWorkouts.map(workout => workout.id));
  }, [savedHydrated, scheduleHydrated, savedWorkouts, cleanupInvalidAssignments]);

  const handleAssignWorkout = (workoutId: string) => {
    if (!assignmentDateKey) return;

    assignWorkoutToDate(assignmentDateKey, workoutId);
    setAssignmentDateKey(null);
    setAssignmentDateLabel(null);
  };

  const handleClearDay = () => {
    if (!assignmentDateKey) return;

    clearDateAssignment(assignmentDateKey);
    setAssignmentDateKey(null);
    setAssignmentDateLabel(null);
  };

  if (!savedHydrated || !scheduleHydrated) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Schedule</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Schedule</Text>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setIsCalendarOpen(true)}
          accessibilityLabel="Open calendar">
          <Ionicons name="calendar-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekBlock}>
        <Text style={styles.weekTitle}>{weekTitleLine}</Text>
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {weekDates.map(({ day, date: calendarDate, dateKey }) => {
          const assignedWorkoutId = schedule[dateKey];
          const assignedWorkout = assignedWorkoutId ? workoutById.get(assignedWorkoutId) : null;
          const assignedExerciseNames = assignedWorkout
            ? assignedWorkout.exercises
                .map(exerciseId => exerciseById.get(exerciseId)?.name ?? exerciseId.replace(/-/g, ' '))
            : [];
          const firstColumnExercises = assignedExerciseNames.slice(0, 4);
          const secondColumnExercises = assignedExerciseNames.slice(4, 8);
          const thirdColumnExercises = assignedExerciseNames.slice(8, 12);
          const dayLabel = `${day} — ${formatShortDate(calendarDate)}`;

          return (
            <View key={dateKey} style={styles.dayRow}>
              <Text style={styles.dayTitle}>{dayLabel}</Text>

              {assignedWorkout ? (
                <View style={styles.assignedWorkoutContainer}>
                  <View style={styles.assignedHeaderRow}>
                    <TouchableOpacity
                      style={styles.assignedTitleContainer}
                      onPress={() => setDetailWorkoutId(assignedWorkoutId)}>
                      <Text style={[styles.assignButtonLabel, styles.assignButtonLabelLeft]} numberOfLines={2}>
                        {assignedWorkout.name}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editButtonInline}
                      onPress={() => {
                        setAssignmentDateKey(dateKey);
                        setAssignmentDateLabel(dayLabel);
                      }}>
                      <Ionicons name="pencil-outline" size={12} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.headerDivider} />

                  <TouchableOpacity
                    style={styles.exerciseListBox}
                    onPress={() => setDetailWorkoutId(assignedWorkoutId)}>
                    <View style={styles.exerciseListColumns}>
                      <View style={styles.exerciseColumn}>
                        {firstColumnExercises.map((exerciseName, index) => (
                          <View key={`left-${index}-${exerciseName}`} style={styles.exerciseBulletRow}>
                            <Text style={styles.exerciseBullet}>•</Text>
                            <Text style={styles.exerciseBulletText} numberOfLines={1} ellipsizeMode="tail">
                              {exerciseName}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.exerciseColumn}>
                        {secondColumnExercises.map((exerciseName, index) => (
                          <View key={`mid-${index}-${exerciseName}`} style={styles.exerciseBulletRow}>
                            <Text style={styles.exerciseBullet}>•</Text>
                            <Text style={styles.exerciseBulletText} numberOfLines={1} ellipsizeMode="tail">
                              {exerciseName}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.exerciseColumn}>
                        {thirdColumnExercises.map((exerciseName, index) => (
                          <View key={`right-${index}-${exerciseName}`} style={styles.exerciseBulletRow}>
                            <Text style={styles.exerciseBullet}>•</Text>
                            <Text style={styles.exerciseBulletText} numberOfLines={1} ellipsizeMode="tail">
                              {exerciseName}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => {
                    setAssignmentDateKey(dateKey);
                    setAssignmentDateLabel(dayLabel);
                  }}>
                  <Text style={styles.assignButtonLabel}>Tap to assign workout</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>


      <Modal
        visible={isCalendarOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCalendarOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <TouchableOpacity style={styles.closeX} onPress={() => setIsCalendarOpen(false)}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() =>
                  setViewingMonth(
                    prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                  )
                }
                accessibilityLabel="Previous month">
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.calendarMonthLabel}>{calendarMonthLabel}</Text>

              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() =>
                  setViewingMonth(
                    prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                  )
                }
                accessibilityLabel="Next month">
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDaysRow}>
              {CALENDAR_WEEK_DAYS.map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.calendarWeekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((dayNumber, index) => {
                if (!dayNumber) {
                  return <View key={`blank-${index}`} style={styles.calendarDayCell} />;
                }

                const cellDate = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth(), dayNumber);
                const isSelected =
                  cellDate.getFullYear() === selectedDate.getFullYear() &&
                  cellDate.getMonth() === selectedDate.getMonth() &&
                  cellDate.getDate() === selectedDate.getDate();

                return (
                  <TouchableOpacity
                    key={`day-${dayNumber}`}
                    style={[styles.calendarDayCell, isSelected && styles.calendarDayCellSelected]}
                    onPress={() => {
                      setSelectedDate(cellDate);
                      setIsCalendarOpen(false);
                    }}>
                    <Text
                      style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                      {dayNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setIsCalendarOpen(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={assignmentDateKey !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setAssignmentDateKey(null);
          setAssignmentDateLabel(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeX}
              onPress={() => {
                setAssignmentDateKey(null);
                setAssignmentDateLabel(null);
              }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Assign Workout</Text>
            <Text style={styles.modalSubtitle}>{assignmentDateLabel}</Text>

            <ScrollView style={styles.workoutList}>
              {workoutOptions.length === 0 ? (
                <Text style={styles.emptyWorkoutOptionsText}>No saved workouts yet</Text>
              ) : (
                workoutOptions.map(workout => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.workoutOption}
                    onPress={() => handleAssignWorkout(workout.id)}>
                    <Text style={styles.workoutOptionText}>{workout.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity style={styles.clearButton} onPress={handleClearDay}>
              <Text style={styles.clearButtonText}>Clear Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setAssignmentDateKey(null);
                setAssignmentDateLabel(null);
              }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailWorkoutId !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailWorkoutId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.workoutModalContent}>
            <View style={styles.workoutModalHeader}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.modalTitle}>{detailWorkout?.name}</Text>
              </View>
              <TouchableOpacity style={styles.closeX} onPress={() => setDetailWorkoutId(null)}>
                <Text style={styles.closeXText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>{detailWorkout?.description}</Text>

            <Text style={styles.exercisesHeader}>Exercises</Text>
            <ScrollView style={styles.exercisesList}>
              {detailExercises.map((exercise, index) => (
                <View key={exercise?.id || index} style={styles.exerciseListItem}>
                  <Text style={styles.exerciseListText}>{exercise?.name}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={() => setDetailWorkoutId(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
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
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    position: 'absolute',
    right: 16,
  },
  weekBlock: {
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  weekTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
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
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 2,
    marginBottom: 12,
    position: 'relative',
  },
  dayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#6a6a6a',
    alignSelf: 'stretch',
    marginHorizontal: -12,
    marginTop: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 5,
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
  assignedWorkoutContainer: {
    minHeight: 88,
    justifyContent: 'flex-start',
  },
  assignedHeaderRow: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  assignedTitleContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginRight: 10,
  },
  assignButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  assignButtonLabelLeft: {
    textAlign: 'left',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
  },
  headerDivider: {
    width: '80%',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginTop: 1,
    marginBottom: 3,
  },
  editButtonInline: {
    marginLeft: 6,
    height: 22,
    width: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseListBox: {
    flex: 1,
    width: '80%',
    alignSelf: 'center',
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 6,
    backgroundColor: '#111',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  exerciseListColumns: {
    flexDirection: 'row',
    gap: 3,
  },
  exerciseColumn: {
    flex: 1,
  },
  exerciseBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  exerciseBullet: {
    color: '#fff',
    fontSize: 9,
    marginRight: 2,
    lineHeight: 11,
  },
  exerciseBulletText: {
    color: '#fff',
    fontSize: 9,
    lineHeight: 11,
    flex: 1,
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
  workoutModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  calendarModalContent: {
    width: '88%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 8,
  },
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  calendarMonthLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  calendarWeekDaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calendarWeekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  calendarDayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayCellSelected: {
    backgroundColor: '#fff',
  },
  calendarDayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  workoutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    marginTop: 8,
    paddingRight: 30,
  },
  modalSubtitle: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 12,
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
    fontSize: 15,
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
});
