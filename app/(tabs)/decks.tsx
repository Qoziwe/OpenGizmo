/**
 * Экран со списком всех созданных колод учебных карточек.
 * Позволяет просматривать колоды и переходить к их изучению.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useDeckStore } from '../../store/decks';
import { colors, fontSizes, spacing } from '../../constants/theme';
import { DeckCard } from '../../components/DeckCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DecksScreen() {
  const decks = useDeckStore((state) => state.decks);

  // Обработчик перехода на экран изучения колоды.
  const handlePressDeck = (deckId: string) => {
    router.push(`/study/${deckId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true, // Показываем заголовок для этого экрана
          headerTitle: 'Мои колоды', // Заголовок экрана
          headerLargeTitle: true, // Крупный заголовок для iOS
          headerStyle: { backgroundColor: colors.background }, // Цвет фона заголовка
          headerShadowVisible: false, // Убираем тень под заголовком
          headerTitleStyle: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.textPrimary },
          headerLargeTitleStyle: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.textPrimary },
          headerTransparent: Platform.OS === 'ios', // Прозрачный заголовок для iOS для эффекта скролла
        }}
      />
      <View style={styles.container}>
        {decks.length === 0 ? (
          // Состояние, когда колод нет
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons
              name="layers-off"
              size={fontSizes.xxl * 2}
              color={colors.textSecondary}
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateText}>
              У вас пока нет колод. Создайте первую!
            </Text>
          </View>
        ) : (
          // Список колод
          <FlatList
            data={decks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DeckCard deck={item} onPress={handlePressDeck} />
            )}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Стили для экрана колод.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyStateIcon: {
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  flatListContent: {
    paddingTop: Platform.OS === 'ios' ? spacing.xxl + spacing.lg : spacing.sm, // Учитываем large title на iOS
    paddingBottom: spacing.md,
  },
});
