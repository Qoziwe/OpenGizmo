/**
 * Корневой файл разметки Expo Router.
 * Настраивает загрузку шрифтов, глобальные стили и обработку ошибок.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../constants/theme';

// Запрет автоматического скрытия SplashScreen до загрузки шрифтов.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Загрузка шрифта Inter из Google Fonts.
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    Inter_600SemiBold: Inter_600SemiBold,
    Inter_700Bold: Inter_700Bold,
  });

  // Обработка ошибок загрузки шрифтов.
  React.useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Скрытие SplashScreen после загрузки шрифтов.
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Если шрифты еще не загружены, показываем пустой экран.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Настройка Stack Navigator для всего приложения */}
        <Stack
          screenOptions={{
            headerShown: false, // Отключаем стандартный заголовок
            contentStyle: { backgroundColor: colors.background }, // Цвет фона всех экранов
          }}
        />
        {/* Настройка StatusBar: светлый текст на темном фоне для лучшей читаемости */}
        <StatusBar style="dark" />
      </View>
    </GestureHandlerRootView>
  );
}

// Глобальные стили для корневого элемента.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
