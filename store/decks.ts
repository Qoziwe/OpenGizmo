/**
 * Zustand store для управления колодами учебных карточек.
 * Обеспечивает персистентность данных с использованием AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck } from '../types';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
const STORAGE_KEY = 'flashai-decks-storage';

// Интерфейс для состояния хранилища колод.
interface DeckStore {
  decks: Deck[];
  addDeck: (deck: Omit<Deck, 'id' | 'created_at' | 'cards_count'>) => void;
  removeDeck: (id: string) => void;
  getDecks: () => Deck[];
  getDeckById: (id: string) => Deck | undefined;
  hydrateDecks: () => Promise<void>;
}

const saveDecks = async (decks: Deck[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ decks }));
  } catch (error) {
    console.warn('Failed to save decks:', error);
  }
};

// Создание Zustand store с ручной персистентностью, без zustand/middleware.
export const useDeckStore = create<DeckStore>()((set, get) => ({
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

    const decks = [...get().decks, newDeck];
    set({ decks });
    saveDecks(decks);
  },

  // Удаление колоды по ID.
  removeDeck: (id) => {
    const decks = get().decks.filter((deck) => deck.id !== id);
    set({ decks });
    saveDecks(decks);
  },

  // Получение всех колод.
  getDecks: () => get().decks,

  // Получение колоды по ID.
  getDeckById: (id: string) => get().decks.find(deck => deck.id === id),

  hydrateDecks: async () => {
    try {
      const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (!rawValue) return;

      const parsed = JSON.parse(rawValue) as { decks?: Deck[]; state?: { decks?: Deck[] } };
      const decks = parsed.decks ?? parsed.state?.decks;
      if (Array.isArray(decks)) {
        set({ decks });
      }
    } catch (error) {
      console.warn('Failed to load decks:', error);
    }
  },
}));

useDeckStore.getState().hydrateDecks();
