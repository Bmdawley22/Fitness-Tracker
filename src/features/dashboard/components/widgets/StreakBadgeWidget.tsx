import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StreakStatus } from '../../types/DashboardContext';

type StreakBadgeWidgetProps = {
  streakDays: number;
  streakStatus?: StreakStatus;
  variant?: 'active' | 'warning';
};

export function StreakBadgeWidget({ streakDays, streakStatus, variant = 'active' }: StreakBadgeWidgetProps) {
  const useWarning = streakStatus === 'atRisk' || variant === 'warning';
  const accentColor = useWarning ? '#FFB020' : '#2CD66F';

  return (
    <View style={[styles.container, { borderColor: accentColor }]} accessibilityLabel="Streak widget" accessibilityRole="text">
      <Text style={styles.emoji}>🔥</Text>
      <View>
        <Text style={[styles.text, { color: accentColor }]}>{streakDays} day streak</Text>
        <Text style={styles.subtext}>{useWarning ? 'Keep it alive today' : 'Momentum is strong'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 88,
    backgroundColor: '#111',
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emoji: { fontSize: 28 },
  text: { fontSize: 18, fontWeight: '700' },
  subtext: { color: '#b5bcc4', fontSize: 12, fontWeight: '600' },
});
