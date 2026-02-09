export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const exercises: Exercise[] = [
  // Core
  { id: 'core-1', name: 'Plank', description: 'Hold a straight body position supported by forearms and toes', category: 'Core' },
  { id: 'core-2', name: 'Side Plank', description: 'Plank position rotated to one side to target obliques', category: 'Core' },
  { id: 'core-3', name: 'Pallof Press', description: 'Press a cable or band straight out while resisting rotation', category: 'Core' },
  { id: 'core-4', name: 'Cable Chop', description: 'Diagonal cable pull across the body from high to low', category: 'Core' },
  { id: 'core-5', name: 'Cable Lift', description: 'Diagonal cable pull across the body from low to high', category: 'Core' },
  { id: 'core-6', name: 'Landmine Rotation', description: 'Rotate a landmine bar side to side using the core', category: 'Core' },
  { id: 'core-7', name: "Farmer's Carry", description: 'Walk while holding heavy weights at your sides', category: 'Core' },
  { id: 'core-8', name: 'Suitcase Carry', description: 'Walk holding weight on one side to challenge core stability', category: 'Core' },
  
  // Chest
  { id: 'chest-1', name: 'Barbell Bench Press', description: 'Press a barbell from chest to full arm extension on a bench', category: 'Chest' },
  { id: 'chest-2', name: 'Incline Barbell Bench Press', description: 'Bench press performed on an incline bench', category: 'Chest' },
  { id: 'chest-3', name: 'Decline Barbell Bench Press', description: 'Bench press performed on a decline bench', category: 'Chest' },
  { id: 'chest-4', name: 'Dumbbell Bench Press', description: 'Press dumbbells from chest while lying on a flat bench', category: 'Chest' },
  { id: 'chest-5', name: 'Incline Dumbbell Bench Press', description: 'Dumbbell press on an incline bench', category: 'Chest' },
  { id: 'chest-6', name: 'Close-Grip Bench Press', description: 'Bench press with narrow grip emphasizing triceps', category: 'Chest' },
  { id: 'chest-7', name: 'Chest Fly', description: 'Bring arms together in a hugging motion to isolate chest', category: 'Chest' },
  { id: 'chest-8', name: 'Incline Chest Fly', description: 'Chest fly performed on an incline bench', category: 'Chest' },
  { id: 'chest-9', name: 'Cable Crossover', description: 'Pull cables together in front of the body', category: 'Chest' },
  { id: 'chest-10', name: 'Pec Deck', description: 'Machine chest fly with fixed arm path', category: 'Chest' },
  { id: 'chest-11', name: 'Push-Up', description: 'Press body weight from the floor using arms and chest', category: 'Chest' },
  { id: 'chest-12', name: 'Weighted Push-Up', description: 'Push-up performed with added resistance', category: 'Chest' },
  
  // Shoulders
  { id: 'shoulders-1', name: 'Overhead Press', description: 'Press weight overhead from shoulder height', category: 'Shoulders' },
  { id: 'shoulders-2', name: 'Push Press', description: 'Overhead press using leg drive for assistance', category: 'Shoulders' },
  { id: 'shoulders-3', name: 'Seated Dumbbell Shoulder Press', description: 'Dumbbell press performed seated', category: 'Shoulders' },
  { id: 'shoulders-4', name: 'Arnold Press', description: 'Rotating dumbbell press starting palms-in', category: 'Shoulders' },
  { id: 'shoulders-5', name: 'Lateral Raise', description: 'Raise arms out to sides to shoulder height', category: 'Shoulders' },
  { id: 'shoulders-6', name: 'Cable Lateral Raise', description: 'Lateral raise performed using a cable machine', category: 'Shoulders' },
  { id: 'shoulders-7', name: 'Front Raise', description: 'Raise arms forward to shoulder height', category: 'Shoulders' },
  { id: 'shoulders-8', name: 'Rear Delt Fly', description: 'Raise arms backward to target rear shoulders', category: 'Shoulders' },
  { id: 'shoulders-9', name: 'Face Pull', description: 'Pull rope toward face to work rear delts and upper back', category: 'Shoulders' },
  { id: 'shoulders-10', name: 'Upright Row', description: 'Pull weight vertically along torso to chest height', category: 'Shoulders' },
  { id: 'shoulders-11', name: 'Y-Raise', description: 'Raise arms in a Y shape to target shoulder stabilizers', category: 'Shoulders' },
  
  // Biceps
  { id: 'biceps-1', name: 'Barbell Curl', description: 'Curl barbell upward using elbow flexion', category: 'Biceps' },
  { id: 'biceps-2', name: 'EZ-Bar Curl', description: 'Curl using angled bar for reduced wrist strain', category: 'Biceps' },
  { id: 'biceps-3', name: 'Dumbbell Curl', description: 'Curl dumbbells upward with palms facing forward', category: 'Biceps' },
  { id: 'biceps-4', name: 'Alternating Dumbbell Curl', description: 'Curl one dumbbell at a time', category: 'Biceps' },
  { id: 'biceps-5', name: 'Hammer Curl', description: 'Curl dumbbells with palms facing inward', category: 'Biceps' },
  { id: 'biceps-6', name: 'Cross-Body Hammer Curl', description: 'Curl dumbbell across torso', category: 'Biceps' },
  { id: 'biceps-7', name: 'Preacher Curl', description: 'Curl performed with arms supported on a preacher bench', category: 'Biceps' },
  { id: 'biceps-8', name: 'Incline Dumbbell Curl', description: 'Curl dumbbells while seated on an incline bench', category: 'Biceps' },
  { id: 'biceps-9', name: 'Cable Curl', description: 'Curl using constant tension from cables', category: 'Biceps' },
  { id: 'biceps-10', name: 'Concentration Curl', description: 'Single-arm curl performed seated with elbow braced', category: 'Biceps' },
  
  // Triceps
  { id: 'triceps-1', name: 'Triceps Pushdown', description: 'Extend arms downward using a cable machine', category: 'Triceps' },
  { id: 'triceps-2', name: 'Rope Pushdown', description: 'Pushdown using rope to allow wider arm extension', category: 'Triceps' },
  { id: 'triceps-3', name: 'Skull Crushers', description: 'Lower weight toward forehead then extend elbows', category: 'Triceps' },
  { id: 'triceps-4', name: 'Close-Grip Bench Press', description: 'Bench press emphasizing triceps via narrow grip', category: 'Triceps' },
  { id: 'triceps-5', name: 'Overhead Triceps Extension', description: 'Extend arms overhead using dumbbell or cable', category: 'Triceps' },
  { id: 'triceps-6', name: 'Dumbbell Kickback', description: 'Extend arm backward to straighten elbow', category: 'Triceps' },
  { id: 'triceps-7', name: 'Dips', description: 'Lower and raise body using parallel bars', category: 'Triceps' },
  { id: 'triceps-8', name: 'Bench Dips', description: 'Dip using bench with feet on floor', category: 'Triceps' },
  { id: 'triceps-9', name: 'Cable Overhead Extension', description: 'Overhead triceps extension using cables', category: 'Triceps' },
  
  // Back
  { id: 'back-1', name: 'Rack Pull', description: 'Deadlift variation starting from elevated bar position', category: 'Back' },
  { id: 'back-2', name: 'Pull-Up', description: 'Pull body upward until chin clears bar', category: 'Back' },
  { id: 'back-3', name: 'Chin-Up', description: 'Pull-up with palms facing toward you', category: 'Back' },
  { id: 'back-4', name: 'Lat Pulldown', description: 'Pull bar down toward chest using cable machine', category: 'Back' },
  { id: 'back-5', name: 'Barbell Row', description: 'Pull barbell toward torso from a hinged position', category: 'Back' },
  { id: 'back-6', name: 'Pendlay Row', description: 'Barbell row starting from the floor each rep', category: 'Back' },
  { id: 'back-7', name: 'Dumbbell Row', description: 'Row dumbbell toward hip with one arm', category: 'Back' },
  { id: 'back-8', name: 'T-Bar Row', description: 'Row weighted bar anchored at one end', category: 'Back' },
  { id: 'back-9', name: 'Seated Cable Row', description: 'Pull cable handle toward torso while seated', category: 'Back' },
  { id: 'back-10', name: 'Chest-Supported Row', description: 'Row with chest supported on bench or machine', category: 'Back' },
  { id: 'back-11', name: 'Straight-Arm Pulldown', description: 'Pull cable down with straight arms', category: 'Back' },
  { id: 'back-12', name: 'Back Extension', description: 'Extend torso upward from a bent position', category: 'Back' },
  
  // Legs
  { id: 'legs-1', name: 'Back Squat', description: 'Squat with barbell resting on upper back', category: 'Legs' },
  { id: 'legs-2', name: 'Front Squat', description: 'Squat with barbell held in front rack position', category: 'Legs' },
  { id: 'legs-3', name: 'Goblet Squat', description: 'Squat holding dumbbell or kettlebell at chest', category: 'Legs' },
  { id: 'legs-4', name: 'Bulgarian Split Squat', description: 'Rear-foot-elevated single-leg squat', category: 'Legs' },
  { id: 'legs-5', name: 'Split Squat', description: 'Stationary lunge-style squat', category: 'Legs' },
  { id: 'legs-6', name: 'Hack Squat', description: 'Squat performed on hack squat machine', category: 'Legs' },
  { id: 'legs-7', name: 'Leg Press', description: 'Press weight away using legs on machine', category: 'Legs' },
  { id: 'legs-8', name: 'Deadlift', description: 'Lift barbell from floor to standing position', category: 'Legs' },
  { id: 'legs-9', name: 'Romanian Deadlift', description: 'Hip hinge deadlift focusing on hamstrings', category: 'Legs' },
  { id: 'legs-10', name: 'Sumo Deadlift', description: 'Wide-stance deadlift with hands inside legs', category: 'Legs' },
  { id: 'legs-11', name: 'Hip Thrust', description: 'Thrust hips upward with weight across hips', category: 'Legs' },
  { id: 'legs-12', name: 'Glute Bridge', description: 'Hip thrust performed from the floor', category: 'Legs' },
  { id: 'legs-13', name: 'Walking Lunge', description: 'Step forward into alternating lunges', category: 'Legs' },
  { id: 'legs-14', name: 'Reverse Lunge', description: 'Step backward into a lunge', category: 'Legs' },
  { id: 'legs-15', name: 'Step-Up', description: 'Step onto elevated platform using one leg', category: 'Legs' },
  { id: 'legs-16', name: 'Leg Curl', description: 'Curl lower legs toward body using machine', category: 'Legs' },
  { id: 'legs-17', name: 'Seated Leg Curl', description: 'Leg curl performed seated', category: 'Legs' },
  { id: 'legs-18', name: 'Leg Extension', description: 'Extend knees against resistance', category: 'Legs' },
  { id: 'legs-19', name: 'Standing Calf Raise', description: 'Raise heels while standing', category: 'Legs' },
  { id: 'legs-20', name: 'Seated Calf Raise', description: 'Raise heels while seated', category: 'Legs' },
  
  // Abs
  { id: 'abs-1', name: 'Hanging Leg Raise', description: 'Raise legs while hanging from a bar', category: 'Abs' },
  { id: 'abs-2', name: "Captain's Chair Leg Raise", description: 'Raise legs using captain\'s chair station', category: 'Abs' },
  { id: 'abs-3', name: 'Ab Wheel Rollout', description: 'Roll wheel forward while maintaining core tension', category: 'Abs' },
  { id: 'abs-4', name: 'Cable Crunch', description: 'Crunch downward using cable resistance', category: 'Abs' },
  { id: 'abs-5', name: 'Decline Sit-Up', description: 'Sit-up performed on decline bench', category: 'Abs' },
  { id: 'abs-6', name: 'Russian Twist', description: 'Rotate torso side to side while seated', category: 'Abs' },
  { id: 'abs-7', name: 'Bicycle Crunch', description: 'Alternating elbow-to-knee crunch', category: 'Abs' },
  { id: 'abs-8', name: 'V-Up', description: 'Simultaneously raise legs and torso', category: 'Abs' },
  { id: 'abs-9', name: 'Dead Bug', description: 'Alternate arm and leg extensions while supine', category: 'Abs' },
  { id: 'abs-10', name: 'Toe Touch Crunch', description: 'Crunch upward to reach toes', category: 'Abs' },
];
