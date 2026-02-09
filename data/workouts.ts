export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: string[]; // Exercise IDs
}

export const workouts: Workout[] = [
  {
    id: 'workout-1',
    name: 'Workout 1',
    description: 'Full body strength workout focusing on compound movements',
    exercises: [
      'legs-1',      // Back Squat
      'chest-1',     // Barbell Bench Press
      'back-2',      // Pull-Up
      'shoulders-3', // Seated Dumbbell Shoulder Press
      'biceps-1',    // Barbell Curl
      'triceps-1',   // Triceps Pushdown
      'abs-1',       // Hanging Leg Raise
    ],
  },
  {
    id: 'workout-2',
    name: 'Workout 2',
    description: 'Upper body hypertrophy with focus on progressive overload',
    exercises: [
      'legs-9',      // Romanian Deadlift
      'chest-5',     // Incline Dumbbell Bench Press
      'back-4',      // Lat Pulldown
      'shoulders-4', // Arnold Press
      'biceps-5',    // Hammer Curl
      'triceps-7',   // Dips
      'abs-4',       // Cable Crunch
    ],
  },
  {
    id: 'workout-3',
    name: 'Workout 3',
    description: 'Balanced push-pull split with core finisher',
    exercises: [
      'legs-7',      // Leg Press
      'back-7',      // Dumbbell Row
      'shoulders-1', // Overhead Press
      'chest-7',     // Chest Fly
      'biceps-7',    // Preacher Curl
      'triceps-3',   // Skull Crushers
      'abs-3',       // Ab Wheel Rollout
    ],
  },
];
