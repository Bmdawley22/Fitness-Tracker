import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StreakBadgeWidgetProps = {
  streakDays: number;
  variant: 'active' | 'warning';
};

export function StreakBadgeWidget({ streakDays, variant }: StreakBadgeWidgetProps) {
  const accentColor = variant === 'active' ? '#2CD66F' : '#FF9500';

  return (
    <View style={[styles.container, { borderColor: accentColor }]}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={[styles.text, { color: accentColor }]}>
        {streakDays} Day{streakDays === 1 ? '' : 's'} Streak!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  emoji: {
    fontSize: 32,
  },
  text: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
});
