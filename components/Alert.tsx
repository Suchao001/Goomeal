import React from 'react';
import FlashMessage, { showMessage, hideMessage, MessageOptions } from 'react-native-flash-message';
import { Alert } from 'react-native';

// ฟังก์ชันสำหรับเรียก alert ทั่วแอป (toast)
export function showAlert({ message, description, type = 'default', ...rest }: MessageOptions) {
  showMessage({
    message,
    description,
    type, // 'success' | 'info' | 'warning' | 'danger' | 'default'
    backgroundColor:
      type === 'success' ? '#22c55e' :
      type === 'danger' ? '#ef4444' :
      type === 'warning' ? '#f59e42' :
      type === 'info' ? '#3b82f6' :
      '#333',
    color: '#fff',
    style: {
      borderRadius: 12,
      marginTop: 10,
      marginHorizontal: 10,
      paddingVertical: 16,
      paddingHorizontal: 18,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    titleStyle: {
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Prompt-Bold',
    },
    textStyle: {
      fontSize: 14,
      fontFamily: 'Prompt-Regular',
    },
    ...rest,
  });
}

// ฟังก์ชัน confirm alert (native dialog)
export function showConfirmAlert({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  Alert.alert(
    title,
    message,
    [
      { text: cancelText, onPress: onCancel, style: 'cancel' },
      { text: confirmText, onPress: onConfirm, style: 'destructive' },
    ],
    { cancelable: true }
  );
}

// FlashMessageRoot: ปรับแต่ง UI ให้ดูสวยขึ้น
export const FlashMessageRoot = () => (
  <FlashMessage
    position="top"
    floating
    duration={3000}
    style={{ zIndex: 9999 }}
    titleStyle={{ fontFamily: 'Prompt-Bold', fontSize: 16 }}
    textStyle={{ fontFamily: 'Prompt-Regular', fontSize: 14 }}
  />
);
