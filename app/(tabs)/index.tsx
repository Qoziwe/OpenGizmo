/**
 * Экран создания новой колоды учебных карточек.
 * Позволяет пользователю вводить текст или прикреплять изображения для генерации карточек.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, fontSizes, spacing, radius } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { AntDesign, Feather } from '@expo/vector-icons';
import { generateFlashcards } from '../../services/gemini';
import { useDeckStore } from '../../store/decks';
import { router } from 'expo-router';
import { FlashCard } from '../../types';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 15);

interface ImageAsset {
  uri: string;
  base64: string;
}

export default function CreateDeckScreen() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const addDeck = useDeckStore((state) => state.addDeck);

  const isFormValid = text.trim().length > 0 || images.length > 0;
  const charCount = text.length;

  // Обработчик выбора изображения.
  const pickImage = async () => {
    // Проверка разрешений на доступ к галерее.
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Разрешение не предоставлено',
        'Для добавления фото необходимо разрешение на доступ к галерее.'
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const newImages: ImageAsset[] = [];
      for (const asset of result.assets) {
        if (images.length + newImages.length >= 5) {
          Alert.alert(
            'Превышен лимит фото',
            'Можно добавить не более 5 изображений.'
          );
          break;
        }

        try {
          // Ресайз изображения до 800px по широкой стороне для оптимизации.
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800, height: 800 } }], // Пропорциональное изменение размера
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );

          if (manipulatedImage.uri && manipulatedImage.base64) {
            newImages.push({
              uri: manipulatedImage.uri,
              base64: manipulatedImage.base64,
            });
          }
        } catch (error) {
          console.error("Ошибка при обработке изображения:", error);
          Alert.alert(
            "Ошибка",
            "Не удалось обработать выбранное изображение."
          );
        }
      }
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  // Удаление изображения из списка.
  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  // Обработчик создания карточек.
  const handleCreateFlashcards = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const base64Images = images.map((img) => img.base64);
      // Вызов Gemini API для генерации карточек.
      const { deck_title, cards: rawCards } = await generateFlashcards(
        text,
        base64Images
      );

      // Присваиваем уникальные ID каждой карточке, если API не возвращает их.
      const cardsWithIds: FlashCard[] = rawCards.map(card => ({
        ...card,
        id: card.id || generateId(),
      }));

      // Добавление новой колоды в хранилище.
      addDeck({
        title: deck_title || 'Новая колода',
        cards: cardsWithIds,
      });

      // Очистка формы
      setText("");
      setImages([]);

      // Переход на экран изучения новой колоды.
      router.push('/(tabs)/decks'); // Переходим к списку колод, чтобы пользователь мог выбрать
    } catch (error) {
      console.error("Ошибка при создании карточек:", error);
      Alert.alert("Ошибка", "Не удалось создать карточки. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Заголовок экрана */}
          <Text style={styles.title}><OpenGizmo></OpenGizmo></Text>
          <Text style={styles.subtitle}>
            Создай карточки из любого материала
          </Text>

          {/* Форма создания карточек */}
          <View style={styles.formContainer}>
            <Input
              placeholder="Вставьте текст, формулы, даты — или опишите что нужно изучить..."
              multiline
              minHeight={120}
              value={text}
              onChangeText={setText}
              style={styles.textInput}
            />

            {/* Блок прикреплённых изображений */}
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <AntDesign name="camera" size={fontSizes.lg} color={colors.textPrimary} />
                <Text style={styles.addImageButtonText}>+ Добавить фото</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                {images.map((img, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(img.uri)}
                      activeOpacity={0.7}
                    >
                      <Feather name="x" size={fontSizes.sm} color={colors.surface} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.charCountText}>Символов: {charCount}</Text>

            <Button
              title={loading ? "Анализирую..." : "Создать карточки"}
              onPress={handleCreateFlashcards}
              disabled={!isFormValid || loading}
              loading={loading}
              style={styles.createButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Оверлей загрузки */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Создаем карточки...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Стили для экрана создания колоды.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    marginBottom: spacing.md,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
  },
  addImageButtonText: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  imageScrollView: {
    flexGrow: 1,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.xs / 2,
    right: spacing.xs / 2,
    backgroundColor: colors.error,
    borderRadius: radius.full,
    width: fontSizes.md + spacing.xs,
    height: fontSizes.md + spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charCountText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  createButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.primary,
  },
});
