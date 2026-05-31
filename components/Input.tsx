/**
 * Общий компонент текстового поля ввода для приложения OpenGizmo.
 * Поддерживает многострочный ввод и динамическую высоту.
 */

import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
} from 'react-native';
import { colors, spacing, radius, fontSizes } from '../constants/theme';

// Определение пропсов для компонента Input.
interface InputProps extends TextInputProps {
  label?: string; // Опциональная метка для поля ввода
  error?: string; // Сообщение об ошибке для отображения под полем
  multiline?: boolean; // Разрешить многострочный ввод
  minHeight?: number; // Минимальная высота для многострочного поля
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  multiline = false,
  minHeight = 120,
  style,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && { minHeight: minHeight, textAlignVertical: 'top' }, // Стиль для многострочного ввода
          error && styles.inputError,
          style,
        ]}
        multiline={multiline}
        placeholderTextColor={colors.textSecondary} // Цвет placeholder текста
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Стили для компонента Input.
const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error, // Цвет границы при ошибке
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
