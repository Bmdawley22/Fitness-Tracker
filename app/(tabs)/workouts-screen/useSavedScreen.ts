import type { ComponentType } from 'react';
import SavedScreen from './SavedScreen';

export type UseSavedScreenResult = {
  Screen: ComponentType;
};

export function useSavedScreen(): UseSavedScreenResult {
  return { Screen: SavedScreen };
}
