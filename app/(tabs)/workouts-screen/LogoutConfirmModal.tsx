import React from 'react';
import { Modal, type ModalProps, type StyleProp, View, type ViewStyle } from 'react-native';

export type LogoutConfirmModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
} & Omit<ModalProps, 'visible' | 'onRequestClose' | 'children'>;

export function LogoutConfirmModal({
  visible,
  onRequestClose,
  children,
  containerStyle,
  animationType = 'fade',
  transparent = true,
  ...modalProps
}: LogoutConfirmModalProps) {
  return (
    <Modal visible={visible} onRequestClose={onRequestClose} animationType={animationType} transparent={transparent} {...modalProps}>
      <View style={containerStyle}>{children}</View>
    </Modal>
  );
}
