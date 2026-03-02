import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Colors, ThemeTokens } from '@/constants/theme';

type FlowToastProps = {
  visible: boolean;
  message: string;
};

export function FlowToast({ visible, message }: FlowToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 360 });
    translateY.value = withTiming(visible ? 0 : 40, { duration: 360 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.toast, animatedStyle]} pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: ThemeTokens.spacing.xl,
    left: ThemeTokens.spacing.md,
    right: ThemeTokens.spacing.md,
    padding: ThemeTokens.spacing.sm,
    borderRadius: ThemeTokens.radii.md,
    backgroundColor: Colors.dark.surfaceLift,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    alignItems: 'center',
  },
  text: {
    color: Colors.dark.text,
    fontFamily: ThemeTokens.fonts.medium,
    fontSize: 14,
  },
});
