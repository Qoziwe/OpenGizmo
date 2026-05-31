/**
 * Компонент для отображения одной колоды учебных карточек в списке.
 * Показывает название колоды, количество карточек, дату создания и стрелку для перехода.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { colors, spacing, radius, fontSizes } from '../constants/theme';
import { Deck } from '../types';
import { AntDesign } from '@expo/vector-icons'; // Импорт иконки стрелки

// Определение пропсов для компонента DeckCard.
interface DeckCardProps {
  deck: Deck; // Объект колоды для отображения
  onPress: (deckId: string) => void; // Обработчик нажатия на колоду
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onPress,
}) => {
  // Форматирование даты создания для более читабельного вида.
  const formattedDate = new Date(deck.created_at).toLocaleDateString(
    'ru-RU', // Локаль для русского языка
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(deck.id)} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title}>{deck.title}</Text>
        <Text style={styles.info}>
          {deck.cards_count} карточек • Создано: {formattedDate}
        </Text>
      </View>
      <AntDesign name="right" size={fontSizes.md} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

// Стили для компонента DeckCard.
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border, // Разделитель снизу
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  info: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
