/**
 * Глобальные типы данных приложения OpenGizmo.
 */

/**
 * Одна учебная карточка с вопросом, вариантами ответа и пояснением.
 */
export interface FlashCard {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

/**
 * Колода (deck) — набор карточек, созданный из материала пользователя.
 */
export interface Deck {
  id: string;
  title: string;
  cards: FlashCard[];
  created_at: string;
  cards_count: number;
}
