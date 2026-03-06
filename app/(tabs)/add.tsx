import React from 'react';
import { CreateFlowModals, type CreateFlowHandle } from './add-screen/CreateFlowModals';
import { useTodayWorkoutScreen } from './add-screen/useTodayWorkoutScreen';

export { CreateFlowModals, type CreateFlowHandle };

export default function AddRoute() {
  const { Screen } = useTodayWorkoutScreen();
  return <Screen />;
}
