import React from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

export type SavedListSectionProps = ScrollViewProps & {
  children: React.ReactNode;
};

export function SavedListSection({ children, ...props }: SavedListSectionProps) {
  return <ScrollView {...props}>{children}</ScrollView>;
}
