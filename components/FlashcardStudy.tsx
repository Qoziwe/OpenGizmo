/**
 * Компонент для отображения одной учебной карточки в режиме изучения.
 * Показывает вопрос, варианты ответов и обрабатывает выбор пользователя.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { FlashCard } from '../types';
import { colors, spacing, radius, fontSizes } from '../constants/theme';
import { Button } from './Button';

// Определение пропсов для компонента FlashcardStudy.
interface FlashcardStudyProps {
  card: FlashCard; // Текущая учебная карточка
  onAnswer: (isCorrect: boolean) => void; // Callback при выборе ответа
  onNext: () => void; // Callback для перехода к следующей карточке
  isLastCard: boolean; // Флаг, указывающий, является ли карточка последней
  loadingNext: boolean; // Флаг загрузки следующей карточки
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  card,
  onAnswer,
  onNext,
  isLastCard,
  loadingNext,
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Сброс состояния компонента при смене карточки.
  useEffect(() => {
    setSelectedOptionIndex(null);
    setShowExplanation(false);
  }, [card]);

  // Обработчик выбора варианта ответа.
  const handleOptionPress = (index: number) => {
    if (selectedOptionIndex !== null) return; // Не позволяем выбирать ответ повторно

    setSelectedOptionIndex(index);
    const isCorrect = index === card.correct_answer_index;
    onAnswer(isCorrect);

    // Анимация появления пояснения.
    setShowExplanation(true);
  };

  // Стили для вариантов ответов в зависимости от их состояния (выбран, правильный, неправильный).
  const getOptionStyle = (index: number) => {
    const style: ViewStyle[] = [styles.optionButton];
    const textStyle: TextStyle[] = [styles.optionText];

    if (selectedOptionIndex !== null) {
      if (index === card.correct_answer_index) {
        // Правильный ответ
        style.push(styles.correctOption);
        textStyle.push(styles.correctOptionText);
      } else if (index === selectedOptionIndex) {
        // Неправильный выбранный ответ
        style.push(styles.incorrectOption);
        textStyle.push(styles.incorrectOptionText);
      } else {
        // Невыбранный неправильный ответ
        style.push(styles.defaultOption);
        textStyle.push(styles.defaultOptionText);
      }
    } else {
      // До выбора ответа все кнопки в состоянии default
      style.push(styles.defaultOption);
      textStyle.push(styles.defaultOptionText);
    }

    return { button: style, text: textStyle };
  };

  return (
    <View style={styles.container}>
      {/* Блок вопроса */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{card.question}</Text>
      </View>

      {/* Варианты ответов */}
      <View style={styles.optionsContainer}>
        {card.options.map((option, index) => {
          const { button, text } = getOptionStyle(index);
          return (
            <TouchableOpacity
              key={index}
              style={button}
              onPress={() => handleOptionPress(index)}
              disabled={selectedOptionIndex !== null} // Отключаем выбор после первого ответа
              activeOpacity={0.7}
            >
              <Text style={text}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Блок пояснения и кнопка "Следующий" */}
      {showExplanation && (
        <Animated.View style={styles.explanationContainer} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
          <Text style={styles.explanationText}>{card.explanation}</Text>
          <Button
            title={isLastCard ? 'Завершить изучение' : 'Следующий →'}
            onPress={onNext}
            style={styles.nextButton}
            loading={loadingNext}
          />
        </Animated.View>
      )}
    </View>
  );
};

// Стили для компонента FlashcardStudy.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: spacing.md,
    alignItems: 'center',
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  questionText: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  optionButton: {
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  optionText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Варианты стилей для кнопок ответов.
  defaultOption: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  defaultOptionText: {
    color: colors.textPrimary,
  },
  correctOption: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  correctOptionText: {
    color: colors.success,
  },
  incorrectOption: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  incorrectOptionText: {
    color: colors.error,
  },
  explanationContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  explanationText: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  nextButton: {
    width: '100%',
  },
});
