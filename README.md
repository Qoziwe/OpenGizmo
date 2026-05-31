# OpenGizmo

OpenGizmo is a mobile study app. It takes your notes, texts, or even photos of handwritten materials and turns them into flashcards for memorization.

## Features

- Creates cards automatically: you provide text or a photo, and Google Gemini 2.5 Flash extracts the main points and splits them into questions and answers.
- Understands images: you can upload up to 5 photos with graphs, formulas, or plain text from your notebook.
- Readable math formatting: formulas, fractions, and exponents are formatted to be easily readable on a phone screen.
- Study modes: you can go through your cards, test your knowledge, and track how well you've memorized the material. Questions are shuffled every time.
- Local storage: all generated flashcard decks are saved directly on your device, so you can study them anytime.

## Tech stack

- Framework: React Native / Expo (SDK 54)
- Navigation: Expo Router
- State management: Zustand (with data persistence via AsyncStorage)
- AI: @google/generative-ai (Gemini API)
- UI: Reanimated for animations, vector icons from standard Expo sets.

## How to run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/opengizmo.git
   cd opengizmo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create an `.env` file in the root of the project (you can just copy `.env.example`).
   Add your Gemini API key:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
   EXPO_PUBLIC_GEMINI_MODEL=gemini-2.5-flash
   ```

4. Start the project:
   ```bash
   npx expo start -c
   ```
   After that, you can scan the QR code using the Expo Go app on your phone, or run an emulator (by pressing `a` for Android or `i` for iOS in the console).

## Project structure

- `app/` — page routing (contains tabs and the study screen).
- `components/` — shared UI components (buttons, inputs, flashcards).
- `constants/` — app theme (colors, fonts, paddings).
- `services/` — external API requests (communicating with Gemini).
- `store/` — application state and logic for saved decks.
- `types/` — TypeScript interfaces.

## License

MIT License. The code is open-source and free to use for any purpose.
