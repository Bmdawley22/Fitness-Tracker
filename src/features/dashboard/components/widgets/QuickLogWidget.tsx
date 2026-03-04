import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTelemetry } from '../../hooks/useTelemetry';

type QuickLogWidgetProps = {
  onTap: () => void;
};

export function QuickLogWidget({ onTap }: QuickLogWidgetProps) {
  const { track } = useTelemetry();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleTap = () => {
    track('quick_action_tap', {
      actionId: 'qa_log_workout',
      actionType: 'log_workout',
    });
    onTap();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handleTap}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 14, stiffness: 260 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        }}
        style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}>
        <Text style={styles.text}>+ Log Workout</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2CD66F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 16,
    color: '#2CD66F',
    fontWeight: '700',
  },
});
