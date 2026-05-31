/**
 * Экран изучения колоды учебных карточек.
 * Показывает карточки по очереди, позволяет выбирать ответы и отслеживать прогресс.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useDeckStore } from '../../store/decks';
import { colors, fontSizes, spacing, radius } from '../../constants/theme';
import { FlashcardStudy } from '../../components/FlashcardStudy';
import { Button } from '../../components/Button';
import { AntDesign, Feather } from '@expo/vector-icons';
import { FlashCard } from '../../types';

// Интерфейс для отслеживания состояния ответов пользователя.
interface AnswerState {
  cardId: string;
  isCorrect: boolean;
}

export default function StudyDeckScreen() {
  const { deckId } = useLocalSearchParams(); // Получаем ID колоды из параметров маршрута
  const getDeckById = useDeckStore((state) => state.getDeckById);
  const removeDeck = useDeckStore((state) => state.removeDeck);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]); // Состояние для хранения ответов
  const [loadingNext, setLoadingNext] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([]);

  const deck = getDeckById(deckId as string);
  const currentCard = shuffledCards[currentCardIndex];

  useEffect(() => {
    if (deck) {
      setShuffledCards([...deck.cards].sort(() => Math.random() - 0.5));
    }
  }, [deck?.id]);

  useEffect(() => {
    // Перенаправляем, если колода не найдена.
    if (!deck) {
      Alert.alert("Ошибка", "Колода не найдена.", [ { text: "ОК", onPress: () => router.back() } ]);
    }
  }, [deck]);

  if (!deck) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка колоды...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Обработчик ответа на карточку.
  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (currentCard) {
      setAnswers((prev) => [...prev, { cardId: currentCard.id, isCorrect }]);
    }
  }, [currentCard]);

  // Обработчик перехода к следующей карточке.
  const handleNextCard = useCallback(() => {
    setLoadingNext(true);
    // Небольшая задержка для плавности перехода и ощущения прогресса.
    setTimeout(() => {
      if (currentCardIndex < shuffledCards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
        setLoadingNext(false);
      } else {
        setShowFinalScreen(true);
        setLoadingNext(false);
      }
    }, 300); // Небольшая задержка для анимации
  }, [currentCardIndex, shuffledCards.length]);

  // Расчет прогресса для прогресс-бара.
  const progress = shuffledCards.length > 0 ? ((currentCardIndex + 1) / shuffledCards.length) * 100 : 0;

  // Расчет результатов для финального экрана.
  const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
  const percentageCorrect = shuffledCards.length > 0
    ? Math.round((correctAnswersCount / shuffledCards.length) * 100)
    : 0;

  const getResultText = () => {
    if (percentageCorrect >= 80) return "Отлично!";
    if (percentageCorrect >= 50) return "Неплохо!";
    return "Нужно повторить";
  };

  // Обработчик удаления колоды.
  const handleDeleteDeck = () => {
    Alert.alert(
      "Удалить колоду",
      "Вы уверены, что хотите удалить эту колоду?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            removeDeck(deck.id);
            router.replace("/(tabs)/decks"); // Возвращаемся к списку колод
          },
        },
      ]
    );
  };

  // Навигация назад к списку колод.
  const handleGoBack = () => {
    router.back();
  };

  // Перезапуск изучения колоды.
  const handleRepeatStudy = () => {
    setCurrentCardIndex(0);
    setAnswers([]);
    setShowFinalScreen(false);
    setLoadingNext(false);
    if (deck) {
      setShuffledCards([...deck.cards].sort(() => Math.random() - 0.5));
    }
  };

  // Переход на главный экран.
  const handleGoHome = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: deck.title,
          headerTitleStyle: { fontSize: fontSizes.lg, fontWeight: "600", color: colors.textPrimary },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Feather name="arrow-left" size={fontSizes.lg} color={colors.textPrimary} />
              <Text style={styles.backButtonText}>Назад</Text>
            </TouchableOpacity>
          ),
          // Кнопка удаления колоды в заголовке
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteDeck} style={styles.deleteButton}>
              <AntDesign name="delete" size={fontSizes.lg} color={colors.error} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Прогресс-бар */}
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>

        {showFinalScreen ? (
          // Финальный экран после изучения всех карточек.
          <View style={styles.finalScreenContainer}>
            <Text style={styles.finalScoreText}>
              {correctAnswersCount} / {shuffledCards.length}
            </Text>
            <Text style={styles.finalResultText}>{getResultText()}</Text>
            <Text style={styles.finalPercentageText}>
              {percentageCorrect}% правильных ответов
            </Text>
            <Button
              title="Повторить"
              onPress={handleRepeatStudy}
              variant="outlined"
              style={styles.finalButton}
            />
            <Button
              title="На главную"
              onPress={handleGoHome}
              style={styles.finalButton}
            />
          </View>
        ) : (
          // Экран изучения карточек.
          <View style={styles.studyContainer}>
            {currentCard && (
              <FlashcardStudy
                card={currentCard}
                onAnswer={handleAnswer}
                onNext={handleNextCard}
                isLastCard={currentCardIndex === shuffledCards.length - 1}
                loadingNext={loadingNext}
              />
            )}
            {/* Счётчик карточек */}
            <Text style={styles.cardCounterText}>
              {currentCardIndex + 1} / {shuffledCards.length}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Стили для экрана изучения колоды.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBarBackground: {
    height: 4,
    width: "100%",
    backgroundColor: colors.border,
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  studyContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? spacing.xxl : spacing.md, // Отступ снизу для iPhone X и выше
  },
  cardCounterText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  // Стили для кнопок навигации в заголовке.
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  deleteButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  // Стили для финального экрана.
  finalScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  finalScoreText: {
    fontSize: fontSizes.xxl * 1.5,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  finalResultText: {
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  finalPercentageText: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  finalButton: {
    width: "80%",
    marginBottom: spacing.md,
  },
});
