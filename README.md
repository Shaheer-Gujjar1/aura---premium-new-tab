# Aura - Premium New Tab Extension

A breathtaking, modular, context-aware personal workspace for your browser.

## Features
- **Context-Aware Design**: Backgrounds and greetings change based on the time of day.
- **Glassmorphism 2.0**: Premium UI with noise textures, border glows, and dynamic lighting.
- **Modular Widgets**:
  - **Clock**: Digital clock with date and personalized greeting.
  - **Weather**: Real-time weather updates (Mocked for preview).
  - **Focus Tasks**: Minimalist todo list with persistence.
  - **QuickLinks**: Speed dial for your most visited sites.
- **State Management**: Powered by Zustand with local storage persistence.
- **Animations**: Smooth, GPU-accelerated transitions with Framer Motion.

## Tech Stack
- React 18+
- TypeScript
- Vite
- Tailwind CSS 4.0
- Framer Motion
- Zustand
- Lucide React

## Setup Instructions
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Build the project: `npm run build`.
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable "Developer mode".
6. Click "Load unpacked" and select the `dist` folder.

## Adding API Keys
To enable real weather data, add your OpenWeatherMap API key to `.env`:
```env
VITE_WEATHER_API_KEY=your_api_key_here
```

## Architecture
The project follows a modular feature-based architecture:
- `src/features`: Independent widget modules.
- `src/stores`: Global state management.
- `src/hooks`: Reusable logic.
- `src/styles`: Design tokens and global styles.
