# KTM Life Care Clinic - Desktop Application

Electron-based desktop application for KTM Life Care Clinic management system.

## Features

- Cross-platform support (Windows, macOS, Linux)
- Native desktop experience
- Integration with existing backend API
- Offline-ready architecture
- Modern UI with Material-UI

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Navigate to desktop directory:
```bash
cd desktop
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL:
   - Update `src/renderer/src/config/api.ts` with your backend URL
   - Or set environment variable: `REACT_APP_API_URL`

## Development

Run the app in development mode:
```bash
npm run dev
```

This will:
- Start Vite dev server for the renderer process
- Launch Electron with hot reload
- Open DevTools automatically

## Building

Build for production:
```bash
npm run build
```

## Packaging

Create installers for different platforms:

**Windows:**
```bash
npm run package:win
```

**macOS:**
```bash
npm run package:mac
```

**Linux:**
```bash
npm run package:linux
```

The installers will be created in the `release/` directory.

## Project Structure

```
desktop/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   └── preload.ts     # Preload script
│   └── renderer/          # React application
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── context/
│       │   ├── config/
│       │   └── types/
│       └── index.html
├── dist/                  # Built files
├── release/               # Packaged applications
└── package.json
```

## Features Implemented

✅ Authentication (Login/Logout)
✅ Dashboard
✅ Layout with Navigation
✅ API Integration
✅ TypeScript Support

## Next Steps

1. Add more pages (Patients, Appointments, Medical Records, etc.)
2. Implement offline storage
3. Add system tray support
4. Implement auto-updates
5. Add keyboard shortcuts

