import React from 'react';
import { useSavedScreen } from './workouts-screen/useSavedScreen';

export default function WorkoutsRoute() {
  const { Screen } = useSavedScreen();
  return <Screen />;
}
