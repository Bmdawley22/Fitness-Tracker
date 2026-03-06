import React from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

export type TodayWorkoutCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TodayWorkoutCard({ children, style }: TodayWorkoutCardProps) {
  return <View style={style}>{children}</View>;
}
