// QuickLogWidget.tsx - Quick workout log button

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, ThemeTokens } from '@/constants/theme';

type QuickLogWidgetProps = {
  onTap: () => void;
};

export function QuickLogWidget({ onTap }: QuickLogWidgetProps) {
  return (
    <Pressable
      onPress={onTap}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}>
      <Text style={styles.text}>+ Log Workout</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: Colors.dark.surfaceLift,
    borderRadius: ThemeTokens.radii.lg,
    borderWidth: 2,
    borderColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.glow,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 16,
    fontFamily: ThemeTokens.fonts.medium,
    color: Colors.dark.accent,
    fontWeight: '700',
  },
});
