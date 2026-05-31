/**
 * Layout для табов приложения (главный экран и экран колод).
 * Настраивает Bottom Tab Navigator с кастомными иконками и стилями.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../constants/theme';
import { AntDesign, Feather } from '@expo/vector-icons'; // Иконки
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Скрываем заголовки экранов внутри табов
        tabBarActiveTintColor: colors.accent, // Цвет активной иконки/текста
        tabBarInactiveTintColor: colors.textSecondary, // Цвет неактивной иконки/текста
        tabBarStyle: [styles.tabBar, { height: (Platform.OS === 'ios' ? 90 : 60) + insets.bottom, paddingBottom: (Platform.OS === 'ios' ? spacing.md : 0) + insets.bottom }], // Общие стили для таббара с учетом safe area
        tabBarLabelStyle: styles.tabBarLabel, // Стили для текста в табе
        tabBarShowLabel: false, // Скрываем названия вкладок
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Создать',
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="plus-circle" size={fontSizes.xl} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="decks"
        options={{
          title: 'Мои колоды',
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="layers" size={fontSizes.xl} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// Стили для таббара и иконок.
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabBarLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },
});
