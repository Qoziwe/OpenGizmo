/**
 * Сервис для взаимодействия с Google Gemini API для генерации учебных карточек.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { FlashCard } from "../types";

// Инициализация Gemini AI модели с использованием API ключа и имени модели из переменных окружения.
// Важно: API ключ и имя модели должны быть доступны через EXPO_PUBLIC_GEMINI_API_KEY и EXPO_PUBLIC_GEMINI_MODEL.
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const MODEL_NAME = process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash"; // Имя модели по умолчанию

// Системный промпт, определяющий поведение AI модели.
// Модель настроена на создание учебных карточек в строго определенном JSON формате.
const SYSTEM_PROMPT = `Ты — умный помощник для создания учебных карточек.
Проанализируй материал и создай карточки для запоминания.
Верни ТОЛЬКО валидный JSON без markdown-обёртки:
{
  "deck_title": "Название темы",
  "cards": [
    {
      "id": "1",
      "question": "Вопрос",
      "options": ["Вариант А", "Вариант Б", "Вариант В", "Вариант Г"],
      "correct_answer_index": 0,
      "explanation": "Пояснение"
    }
  ]
}
Правила: 5-15 карточек, 1 правильный + 3 неправильных ответа, правильный ответ на разных позициях (не всегда 0), вопросы проверяют понимание а не просто факты. Если материал на русском — отвечай на русском.
ВАЖНО: Для математики используй понятные Unicode символы, чтобы текст было удобно читать (например: дроби как a/b или ½, степени как x² или x^n, корни как √x, логарифмы как log₂x). Не используй LaTeX (типа \frac или \sqrt).`;

/**
 * Генерирует учебные карточки на основе текстового материала и изображений.
 * @param text Текстовый материал для анализа.
 * @param base64Images Массив изображений в формате base64 для анализа.
 * @returns Объект с названием колоды и массивом сгенерированных карточек.
 */
export async function generateFlashcards(
  text: string,
  base64Images: string[]
): Promise<{ deck_title: string; cards: FlashCard[] }> {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Используем MODEL_NAME
  
  // Формирование частей запроса для модели: системный промпт, изображения и текстовый материал.
  const parts: any[] = [{ text: SYSTEM_PROMPT }];
  
  // Добавление изображений к запросу, если они есть.
  for (const b64 of base64Images) {
    parts.push({ inlineData: { data: b64, mimeType: "image/jpeg" } });
  }
  
  // Добавление текстового запроса, если он не пустой.
  if (text.trim()) {
    parts.push({ text: `Материал для изучения:\n${text}` });
  }
  
  const result = await model.generateContent({ contents: [{ role: "user", parts }] });
  const responseText = result.response.text();
  
  // Очистка ответа от markdown-обертки и парсинг JSON.
  const clean = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean);
}
