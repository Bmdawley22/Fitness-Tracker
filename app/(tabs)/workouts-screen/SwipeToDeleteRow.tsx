import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, PanResponder, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const REVEAL_WIDTH = 84;
const SNAP_BACK_THRESHOLD_RATIO = 0.15;
const AUTO_DELETE_THRESHOLD_RATIO = 0.6;

type SwipeToDeleteRowProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  onRequestDelete: () => void;
  onLongPress?: () => void;
  onPressMenu?: () => void;
  disabled?: boolean;
  resetToken?: number;
  styles: any;
};

export function SwipeToDeleteRow({
  title,
  subtitle,
  onPress,
  onRequestDelete,
  onLongPress,
  onPressMenu,
  disabled,
  resetToken,
  styles,
}: SwipeToDeleteRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidthRef = useRef(0);
  const [rowWidth, setRowWidth] = useState(0);
  const [isFullDeleteVisual, setIsFullDeleteVisual] = useState(false);
  const confirmTriggeredRef = useRef(false);
  const currentTranslateRef = useRef(0);

  const revealWidth = Math.min(REVEAL_WIDTH, rowWidth || REVEAL_WIDTH);

  const animateTo = useCallback(
    (value: number, onDone?: () => void) => {
      Animated.spring(translateX, {
        toValue: value,
        useNativeDriver: true,
        damping: 22,
        stiffness: 260,
        mass: 0.8,
        overshootClamping: true,
      }).start(() => onDone?.());
    },
    [translateX],
  );

  const requestDeleteOnce = useCallback(() => {
    if (confirmTriggeredRef.current) return;
    confirmTriggeredRef.current = true;
    onRequestDelete();
  }, [onRequestDelete]);

  useEffect(() => {
    confirmTriggeredRef.current = false;
    setIsFullDeleteVisual(false);
    animateTo(0);
  }, [animateTo, resetToken]);

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentTranslateRef.current = value;
    });

    return () => {
      translateX.removeListener(id);
    };
  }, [translateX]);

  const handleGestureRelease = useCallback(() => {
    const width = rowWidthRef.current;
    if (width <= 0) return;

    const drag = Math.max(0, -currentTranslateRef.current);

    if (drag < width * SNAP_BACK_THRESHOLD_RATIO) {
      setIsFullDeleteVisual(false);
      animateTo(0);
      return;
    }

    if (drag >= width * AUTO_DELETE_THRESHOLD_RATIO) {
      setIsFullDeleteVisual(true);
      animateTo(-width, requestDeleteOnce);
      return;
    }

    setIsFullDeleteVisual(false);
    animateTo(-revealWidth);
  }, [animateTo, requestDeleteOnce, revealWidth]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (disabled) return false;
          return Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderGrant: () => {
          confirmTriggeredRef.current = false;
          setIsFullDeleteVisual(false);
        },
        onPanResponderMove: (_, gestureState) => {
          const width = rowWidthRef.current;
          if (width <= 0 || confirmTriggeredRef.current) return;
          const next = Math.min(0, Math.max(-width, gestureState.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: () => {
          handleGestureRelease();
        },
        onPanResponderTerminate: () => {
          handleGestureRelease();
        },
      }),
    [disabled, handleGestureRelease, translateX],
  );

  const onLayoutRow = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    rowWidthRef.current = width;
    setRowWidth(width);
  };

  const actionWidth = isFullDeleteVisual ? '100%' : revealWidth;

  return (
    <View style={styles.swipeRowContainer} onLayout={onLayoutRow}>
      <TouchableOpacity
        style={[styles.deleteActionArea, { width: actionWidth }]}
        onPress={requestDeleteOnce}
        activeOpacity={0.85}
        disabled={disabled}>
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </TouchableOpacity>

      <Animated.View style={[styles.listItem, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <Pressable style={styles.rowInner} onPress={onPress} onLongPress={onLongPress} android_ripple={{ color: 'transparent' }}>
          <View style={styles.workoutContent}>
            <Text style={styles.listItemText}>{title}</Text>
            {subtitle ? <Text style={styles.listItemDescription}>{subtitle}</Text> : null}
          </View>
          {onPressMenu ? (
            <Pressable
              style={styles.menuButton}
              onPress={event => {
                event?.stopPropagation?.();
                onPressMenu();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
            </Pressable>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}
