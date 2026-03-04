import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

type ArrowAffordanceProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function ArrowAffordance({ label, onPress, style }: ArrowAffordanceProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const glow = useSharedValue(0.2);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle, style]}>
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label} action`}
        accessibilityHint="Opens the related workout action"
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 14, stiffness: 260 });
          translateX.value = withTiming(2, { duration: 140 });
          glow.value = withTiming(0.45, { duration: 140 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
          translateX.value = withTiming(0, { duration: 140 });
          glow.value = withTiming(0.2, { duration: 180 });
        }}
        android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
        style={styles.button}>
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minWidth: 72,
    borderRadius: 14,
    backgroundColor: '#1f8f4a',
    borderWidth: 1,
    borderColor: '#2CD66F',
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2CD66F',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
});
