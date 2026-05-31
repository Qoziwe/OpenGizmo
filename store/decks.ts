/**
 * Zustand store для управления колодами учебных карточек.
 * Обеспечивает персистентность данных с использованием AsyncStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck } from '../types';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 15);

// Интерфейс для состояния хранилища колод.
interface DeckStore {
  decks: Deck[];
  addDeck: (deck: Omit<Deck, 'id' | 'created_at' | 'cards_count'>) => void;
  removeDeck: (id: string) => void;
  getDecks: () => Deck[];
  getDeckById: (id: string) => Deck | undefined;
}

// Создание Zustand store с middleware для персистентности.
export const useDeckStore = create<DeckStore>()(
  persist(
    (set, get) => ({
      decks: [],

      // Добавление новой колоды.
      // Автоматически генерирует ID, дату создания и подсчитывает количество карточек.
      addDeck: (newDeckData) => {
        const newDeck: Deck = {
          id: generateId(), // Генерация уникального ID для колоды
          created_at: new Date().toISOString(), // Установка текущей даты создания
          cards_count: newDeckData.cards.length, // Подсчет количества карточек
          ...newDeckData,
        };
        set((state) => ({ decks: [...state.decks, newDeck] }));
      },

      // Удаление колоды по ID.
      removeDeck: (id) =>
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== id),
        })),

      // Получение всех колод.
      getDecks: () => get().decks,

      // Получение колоды по ID.
      getDeckById: (id: string) => get().decks.find(deck => deck.id === id),
    }),
    {
      name: 'flashai-decks-storage', // Уникальное имя для хранилища
      storage: createJSONStorage(() => AsyncStorage), // Использование AsyncStorage для хранения JSON
    }
  )
);
