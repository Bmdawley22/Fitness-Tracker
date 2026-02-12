import rawExercises from '@/vendor/free-exercise-db/exercises.json';

export type SeededExercise = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  image: string;
  equipment: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
};

type RawFedbExercise = {
  name?: string;
  description?: string;
  instructions?: string[] | string;
  images?: string[];
  equipment?: string;
  category?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
};

export const FEDB_SEED_VERSION = 'fedb-v1-200';
export const FEDB_SEED_SOURCE = 'free-exercise-db';

const SEED_ID_PREFIX = 'seed-fedb-';
const FALLBACK_VALUE = 'Other';

const toTitleCase = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .map(part => (part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : ''))
    .filter(Boolean)
    .join(' ');

const normalizeArray = (values?: string[]): string[] => {
  if (!Array.isArray(values)) return [];
  return values.map(value => toTitleCase(value)).filter(Boolean);
};

const normalizeInstructions = (value?: string[] | string): string => {
  if (Array.isArray(value)) {
    return value.map(entry => entry.trim()).filter(Boolean).join('\n');
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
};

const normalizeSingleValue = (value?: string): string => {
  if (!value) return FALLBACK_VALUE;
  const normalized = toTitleCase(value);
  return normalized || FALLBACK_VALUE;
};

const normalizeName = (value?: string): string => value?.trim() ?? '';

const buildStableKey = (name: string): string => {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
  return base || 'exercise';
};

const computeFedbSeededExercises = (): SeededExercise[] => {
  const keyCounts = new Map<string, number>();

  const transformed = (rawExercises as RawFedbExercise[])
    .map((raw, index) => {
      const name = normalizeName(raw.name);
      if (!name) return null;

      const baseKey = buildStableKey(name);
      const existingCount = keyCounts.get(baseKey) ?? 0;
      const stableKey = existingCount === 0 ? baseKey : `${baseKey}-${existingCount + 1}`;
      keyCounts.set(baseKey, existingCount + 1);

      const instructions = normalizeInstructions(raw.instructions);
      const description = (raw.description ?? '').trim() || instructions.split('\n')[0] || '';
      const primaryMuscles = normalizeArray(raw.primaryMuscles);
      const secondaryMuscles = normalizeArray(raw.secondaryMuscles);
      const image = Array.isArray(raw.images) && raw.images[0] ? raw.images[0] : '';
      const equipment = normalizeSingleValue(raw.equipment);
      const category = normalizeSingleValue(raw.category);

      return {
        stableKey,
        record: {
          id: `${SEED_ID_PREFIX}${stableKey}`,
          name,
          description,
          instructions,
          image,
          equipment,
          category,
          primaryMuscles,
          secondaryMuscles,
        },
      };
    })
    .filter(Boolean) as { stableKey: string; record: SeededExercise }[];

  const sorted = transformed.sort((a, b) => a.stableKey.localeCompare(b.stableKey));
  return sorted.slice(0, 200).map(entry => entry.record);
};

const FEDB_SEEDED_EXERCISES = computeFedbSeededExercises();

export const getFedbSeededExercises = (): SeededExercise[] => FEDB_SEEDED_EXERCISES;
