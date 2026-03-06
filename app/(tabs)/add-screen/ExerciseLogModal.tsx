import React from 'react';
import { Modal, type ModalProps, type StyleProp, View, type ViewStyle } from 'react-native';

export type ExerciseLogModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
} & Omit<ModalProps, 'visible' | 'onRequestClose' | 'children'>;

export function ExerciseLogModal({
  visible,
  onRequestClose,
  children,
  containerStyle,
  animationType = 'fade',
  transparent = true,
  ...modalProps
}: ExerciseLogModalProps) {
  return (
    <Modal visible={visible} onRequestClose={onRequestClose} animationType={animationType} transparent={transparent} {...modalProps}>
      <View style={containerStyle}>{children}</View>
    </Modal>
  );
}
