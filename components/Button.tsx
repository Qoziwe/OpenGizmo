/**
 * Общий компонент кнопки для приложения OpenGizmo.
 * Поддерживает различные стили: основной (accent), контурный (outlined) и текстовый (text).
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, radius, fontSizes } from '../constants/theme';

// Определение пропсов для компонента Button.
interface ButtonProps {
  title: string; // Текст кнопки
  onPress: () => void; // Обработчик нажатия
  style?: ViewStyle; // Дополнительные стили для контейнера кнопки
  textStyle?: TextStyle; // Дополнительные стили для текста кнопки
  variant?: 'primary' | 'outlined' | 'text'; // Вариант стиля кнопки
  disabled?: boolean; // Отключена ли кнопка
  loading?: boolean; // Состояние загрузки (показывает индикатор загрузки)
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  // Определение базовых стилей в зависимости от варианта кнопки и состояния disabled/loading.
  const buttonStyles: ViewStyle[] = [styles.button];
  const textStyles: TextStyle[] = [styles.buttonText];

  if (variant === 'primary') {
    buttonStyles.push(styles.primaryButton);
    textStyles.push(styles.primaryButtonText);
  } else if (variant === 'outlined') {
    buttonStyles.push(styles.outlinedButton);
    textStyles.push(styles.outlinedButtonText);
  } else if (variant === 'text') {
    buttonStyles.push(styles.textButton);
    textStyles.push(styles.textButtonText);
  }

  // Добавление стилей для disabled состояния.
  if (disabled || loading) {
    buttonStyles.push(styles.disabledButton);
    textStyles.push(styles.disabledButtonText);
  }

  // Применение пользовательских стилей.
  buttonStyles.push(style);
  textStyles.push(textStyle);

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading} // Отключаем кнопку при загрузке или явно disabled
      activeOpacity={0.7} // Уменьшаем прозрачность при нажатии для визуального отклика
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.textSecondary} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Стили для компонента Button.
const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48, // Минимальная высота кнопки для удобства нажатия
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  // Стили для основного варианта кнопки (primary).
  primaryButton: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  // Стили для контурного варианта кнопки (outlined).
  outlinedButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlinedButtonText: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  // Стили для текстового варианта кнопки (text).
  textButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  textButtonText: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  // Стили для отключенной кнопки.
  disabledButton: {
    opacity: 0.5, // Уменьшаем прозрачность для индикации отключенного состояния
  },
  disabledButtonText: {
    // Цвет текста в disabled состоянии, если он отличается от основного
  },
});
