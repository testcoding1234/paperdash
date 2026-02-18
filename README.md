# PaperDash - 電子ペーパーダッシュボード

A production-ready, minimal, modular PWA dashboard generator optimized for NFC e-paper displays (Santek EZ Sign 2.9" 4-color).

## Overview

PaperDash is a Japanese-language minimal dashboard web application that allows users to design customizable dashboards and export 4-color e-paper optimized PNG images for manual transfer via the EZ Sign NFC official app.

## Features

### Modular Widget System
- **WeatherWidget**: Japan Meteorological Agency (JMA) weather integration
- **GithubGrassWidget**: GitHub contribution graph (7-day or 30-day view)
- **TodoWidget**: Local storage-based task manager

Each widget is:
- Toggleable (on/off)
- Resizable (S / M / L)
- Reorderable using UP/DOWN buttons

### Dashboard Editor
- Mobile-first, minimal Japanese UX
- Widget list panel with reordering controls
- Size selector and settings for each widget
- Layout toggle: 1-column (default) or 2-column mode
- Add widget functionality

### E-Paper Image Export
- Canvas-based PNG generation optimized for 2.9" e-paper displays
- 4-color palette support (black/white/red/yellow)
- Fixed aspect ratio (296x128px)
- High contrast rendering for e-ink readability

### Settings
- Weather location selector (Tokyo, Nagoya, Osaka, custom code)
- GitHub username and optional Personal Access Token (stored locally)
- Default layout preferences
- Contribution graph range toggle (7/30 days)

## Technical Stack

- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for minimal styling
- **Canvas API** for image rendering
- **PWA** support with manifest
- **LocalStorage** for persistence (no backend required)

## Setup

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Add Widgets**: Click "ウィジェット追加" to add weather, GitHub, or todo widgets
2. **Configure**: Use the settings button on each widget to configure location, username, etc.
3. **Arrange**: Use ↑↓ buttons to reorder widgets and S/M/L to resize
4. **Generate Image**: Click "更新して画像生成" to create an e-paper optimized PNG
5. **Download**: Save the generated image
6. **Transfer**: Manually upload the PNG to your EZ Sign device using the official NFC app

## Project Structure

```
src/
├── components/       # React components (Dashboard, Settings, etc.)
├── widgets/          # Widget implementations
├── utils/            # Utilities (storage, API, rendering)
├── types/            # TypeScript types
├── constants/        # Constants and labels (Japanese)
└── App.tsx          # Main application
```

## Design Philosophy

- **Minimal**: Muji-like aesthetic, calm and professional
- **E-paper friendly**: High contrast, no gradients
- **Performance**: Lightweight, fast initial load (<2s)
- **Mobile-first**: Optimized for Android Chrome
- **Offline-capable**: PWA with service worker support

## Color Palette

Limited to e-paper safe colors:
- Black (#000000)
- White (#FFFFFF)
- Red (#FF0000)
- Yellow (#FFFF00)

## License

MIT
